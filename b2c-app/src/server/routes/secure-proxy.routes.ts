import { Router, Request, Response } from 'express';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import { apiConfig, getHotelsCredentials } from '../config/apiConfig';
const butter = require('buttercms')(apiConfig.secrets.BUTTERCMS_KEY, true);
import * as crypto from 'crypto';
import {
  LambdaClient,
  InvokeCommand,
} from '@aws-sdk/client-lambda';
import qs from 'qs';
import { encryptToken, decryptToken } from './encryption-utils';

const router = Router();
router.use(cookieParser());

router.get('/health', (req, res) => {

  res.status(200).send({ status: 'UP', timestamp: new Date().toISOString(), env: apiConfig.env, endPoints: apiConfig.baseUrl, webApi: apiConfig.webApiUrl  });
});

// Utility: Extract and store token
const storeTokenInCookie = (token: string, res: Response) => {
  const encryptedToken = encryptToken(token);

  // Clear old token
  res.cookie('ts_atkn_hoh', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
  });

  // Set new encrypted token
  res.cookie('ts_atkn_hoh', encryptedToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};

const storeHotelsJWTTokenInCookie = (hotelsToken: string, res: Response) => {
  res.cookie('hotelsToken', hotelsToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  });
};

// Utility: Remove token from response before sending to frontend
const stripTokenFromResponse = (response: any) => {
  const clone = { ...response };
  if (clone?.data?.token) delete clone.data.token;
  if (clone?.data?.signinResponse?.token) delete clone.data.signinResponse.token;
  return clone;
};

// Store Auth Token
router.post('/store-auth-token', (req: Request, res: Response) => {
  const { authToken } = req.body;
  if (authToken) {
    storeTokenInCookie(authToken, res);
    return res.status(200).send({ message: 'Auth token stored successfully' });
  }
  return res.status(400).send({ message: 'Missing auth token' });
});

// Store User Profile
router.post('/store-user-profile', (req: Request, res: Response) => {
  const { userData } = req.body;
  if (userData) {
    res.cookie('userData', JSON.stringify(userData), {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(200).send({ message: 'User profile stored successfully' });
  }
  return res.status(400).send({ message: 'Missing user profile data' });
});

// Get secret by key
// router.get('/get-secret-key/:key', (req: Request, res: Response) => {
//   const { key } = req.params;
//   const secret = apiConfig.secrets[key as keyof typeof apiConfig.secrets];
//   if (secret) return res.send({ value: secret });
//   return res.status(404).send({ message: 'Key not found' });
// });

// Authentication proxy via verify otp
router.post('/authentication', async (req: Request, res: Response) => {
  try {
    const authUrl = `${apiConfig.baseUrl}/v1/user/login-otp-ver`;
    const response = await axios.post(authUrl, req.body, { headers: apiConfig.headers.json });

    const token = response?.data?.data?.token;
    if (token) storeTokenInCookie(token, res);

    return res.send(stripTokenFromResponse(response.data));
  } catch (error: any) {
    return res.status(500).send({ message: 'Proxy request failed', error: error.message });
  }
});

// Authentication proxy via password
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('environment ----->>>>', apiConfig.env);
    const authUrl = `${apiConfig.baseUrl}/api/v3/login`;
    const response = await axios.post(authUrl, req.body);

    const token = response?.data?.data?.token;
    if (token) storeTokenInCookie(token, res);

    return res.send(stripTokenFromResponse(response.data));
  } catch (error: any) {
    return res.status(500).send({ message: 'Proxy request failed', error: error.message });
  }
});

// Common function for protected routes
const getTokenFromCookies = (req: Request): string | null => {
  const cookies = req.headers.cookie || '';
  const encrypted = cookies.match(/ts_atkn_hoh=([^;]+)/)?.[1];

  if (!encrypted) return null;

  try {
    return decryptToken(decodeURIComponent(encrypted));
  } catch (err) {
    console.error('Token decryption failed:', err);
    return null;
  }
};

const getHotelTokenFromCookies = (req: Request): string | null => {
  const cookies = req.headers.cookie || '';
  return cookies.match(/hotelsToken=([^;]+)/)?.[1] || null;
};

// fetching user data
router.post('/userData', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const payload = { userAgent: req.body.userAgent, token };
  try {
    const result = await axios.post(`${apiConfig.baseUrl}/api/v3/account`, payload);
    return res.send(stripTokenFromResponse(result.data));
  } catch (err: any) {
    return res.status(500).send({ message: 'Booking failed', error: err.message });
  }
});

router.post('/userOTPData', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const payload = { userAgent: req.body.userAgent, token };
  try {
    const result = await axios.post(`${apiConfig.baseUrl}/api/v3/account`, payload);
    const token = result?.data?.data?.token;
    if (token) storeTokenInCookie(token, res);
    return res.send(stripTokenFromResponse(result.data));
  } catch (err: any) {
    return res.status(500).send({ message: 'Booking failed', error: err.message });
  }
});

// PUT /userData
router.put('/userData', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const payload = { userAgent: req.body.userAgent, contactInfo: req.body.contactInfo, token:token };

  try {
    const result = await axios.put(`${apiConfig.baseUrl}/api/v3/account`, payload);
    return res.send(stripTokenFromResponse(result.data));
  } catch (err: any) {
    return res.status(500).send({ message: 'PUT request failed', error: err.message });
  }
});

// Booking history
router.post('/myBookings/:id?', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const { id } = req.params;
  const payload = { userAgent: req.body.userAgent, token };

  const url = id
    ? `${apiConfig.baseUrl}/api/v3/booking/${id}`
    : `${apiConfig.baseUrl}/api/v3/booking`;

  try {
    const result = await axios.post(url, payload);
    return res.send(stripTokenFromResponse(result.data));
  } catch (err: any) {
    return res.status(500).send({
      message: 'Booking history fetch failed',
      error: err.message,
    });
  }
});

// My-Account travellers delete
router.post('/traveller/:id?', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const { id } = req.params;
  let payload = id ? { userAgent: req.body.userAgent, token } : { ...req.body, token }

  const url = id
    ? `${apiConfig.baseUrl}/api/v3/traveller/${id}`
    : `${apiConfig.baseUrl}/api/v3/traveller`;

  try {
    const result = await axios.post(url, payload);
    return res.send(stripTokenFromResponse(result.data));
  } catch (err: any) {
    return res.status(500).send({
      message: 'Traveller history fetch failed',
      error: err.message,
    });
  }
});

// My-Account travellers update
router.put('/traveller/:id?', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const { id } = req.params;
  const payload = { ...req.body, token }; 

  const url = id
    ? `${apiConfig.baseUrl}/api/v3/traveller/${id}`
    : `${apiConfig.baseUrl}/api/v3/traveller`;

  try {
    const result = await axios.put(url, payload);
    return res.send(stripTokenFromResponse(result.data));
  } catch (err: any) {
    return res.status(500).send({
      message: 'Traveller update failed',
      error: err.message,
    });
  }
});

// My-account add payments-cards
router.post('/payment/card/:cardNo?', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const { cardNo } = req.params;
  const payload = { paymentCard: req.body.paymentCard, userAgent: req.body.userAgent, token };

  const url = cardNo
    ? `${apiConfig.baseUrl}/api/v3/payment/card/${cardNo}`
    : `${apiConfig.baseUrl}/api/v3/payment/card`;

  try {
    const result = await axios.post(url, payload);
    return res.send(stripTokenFromResponse(result.data));
  } catch (err: any) {
    return res.status(500).send({
      message: 'Payment Card fetched failed',
      error: err.message,
    });
  }
});

// Update password
router.post('/account/change-password', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const payload = { ...req.body, token };

  try {
    const response = await axios.post(
      `${apiConfig.baseUrl}/api/v3/update_password`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiConfig.secrets.UPDATE_PWD_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(response.status).send(stripTokenFromResponse(response.data));
  } catch (error: any) {
    console.error('Update password failed:', error.message);
    return res.status(500).send({
      message: 'Update password failed',
      error: error.message,
    });
  }
});

// ts-plus subscription update
router.post('/tsplus-subscription/update', async (req: Request, res: Response) => {

  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const headers = {
    'X-Token': token,
  };

  const payload = { ...req.body, token };

  const backendUrl = `${apiConfig.baseUrl}/api/v1/subscriptions/tsplus`;

  try {
    const response = await axios.post(backendUrl, payload, { headers });
    return res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Subscription update failed:', error.message);
    return res.status(500).send({
      message: 'Failed to update subscription',
      error: error?.response?.data || error.message,
    });
  }
});

// ts-plus subscription update
router.post('/mastercard-subscription', async (req: Request, res: Response) => {

  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const headers = {
    'X-Token': token,
  };

  const payload = { ...req.body, token };

  const backendUrl = `${apiConfig.baseUrl}/api/v1/subscriptions/mastercard`;

  try {
    const response = await axios.post(backendUrl, payload, { headers });
    return res.status(response.status).send(response.data);
  } catch (error: any) {
   const statusCode = error?.response?.status || 500;
    const errorData = error?.response?.data || { message: error.message };

    // ✅ Forward exact error response and status from backend
    return res.status(statusCode).send(errorData);
  }
});

// ts-plus subscription update
router.get('/retrieve-mastercard-monthly-count', async (req: Request, res: Response) => {
  const backendUrl = `${apiConfig.baseUrl}/api/v1/subscriptions/mastercard`;
  try {
    const response = await axios.get(backendUrl);
    console.log('Mastercard monthly count response:', response.data);
    return res.status(response.status).send(response.data);
  } catch (error: any) {
   const statusCode = error?.response?.status || 500;
    const errorData = error?.response?.data || { message: error.message };

    // ✅ Forward exact error response and status from backend
    return res.status(statusCode).send(errorData);
  }
});

// Book API
router.post('/bookFlight', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  // Construct query string from optional query params
  const queryParams = new URLSearchParams(req.query as Record<string, string>).toString();
  const url = `${apiConfig.webApiUrl}/website-services/api/book/${queryParams ? `?${queryParams}` : ''}`;

  // Capture and forward only selected headers from the incoming request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'TS-country': req.headers['ts-country'] as string || 'ZA',
    'TS-language': req.headers['ts-language'] as string || 'en',
  };

  const payload = {
    ...req.body,
    loggedonToken : token,
  };

  try {
    const result = await axios.post(url, payload, { headers: headers });
    return res.send(result.data);
  } catch (err: any) {
    return res.status(500).send({ message: 'Booking failed', error: err.message });
  }
});

//Get Hotel Bookings 
router.post('/hotelsMyBookings', async (req: Request, res: Response) => {
  
  const url = `${apiConfig.hotelsBaseUrl}/user/authenticate`; 

  const { identifier, email } = req.body;
  if (!identifier) {
    return res.status(400).send({ message: 'Identifier is required.' });
  }

  // Capture and forward only selected headers from the incoming request
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  // Dynamically get the credentials using the identifier
  const hotelsCredentials = getHotelsCredentials(identifier);

  const payload = hotelsCredentials;
  

  let authToken: string;
  try {
    const authResult = await axios.post(url, payload, { headers: headers }); 
   
    authToken = authResult.data.jwtToken;
    if (!authToken) {
      console.error('Authentication API did not return a token:', authResult.data);
      return res.status(500).send({ message: 'Authentication failed: Token not received.' });
    }else{
      storeHotelsJWTTokenInCookie(authToken, res);
    }
  } catch (err: any) {
    console.error('Authentication API failed:', err.message); 
    return res.status(500).send({ message: 'Authentication API call failed', error: err.message });
  }

  // --- STEP 2: Use the token for the HotelsUserAccountHistory API call ---
  const protectedDataUrl = `${apiConfig.hotelsBaseUrl}/userAccountHistory`; 
  const protectedDataHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Authorization': `Bearer ${authToken}`
  }; 

  const protectedDataPayload = {
    email: email,
  }; 
  try {
    const protectedDataResult = await axios.post(protectedDataUrl, protectedDataPayload, { headers: protectedDataHeaders });
    // Return the userAccountHistory 
    return res.send(protectedDataResult.data);
  } catch (err: any) {
    console.error('Hotels userAccountHistory API failed:', err.message);
    // It's good to distinguish errors. If 401/403, it's likely an auth issue with the token.
    if (axios.isAxiosError(err) && err.response) {
      return res.status(err.response.status).send({
        message: 'Hotels userAccountHistory API call failed',
        error: err.response.data || err.message
      });
    }
    return res.status(500).send({ message: 'Hotels userAccountHistory API call failed', error: err.message });
  }

});

//Bin Validation
router.post('/binValidation', async (req: Request, res: Response) => {

  let cpy_source: String;
  const { bin, cpySource } = req.body; 
  if (!bin) {
    return res.status(400).send({ message: 'Card Number is required.' });
  }
  cpy_source = cpySource;
  if(cpy_source == ''){
    cpy_source = "zaweb";
  } 
  const client = new LambdaClient({
        region: apiConfig.secrets.BIN_DATA_API_REGION,
        credentials: {
          accessKeyId: apiConfig.secrets.BIN_DATA_API_ACCESS_KEY,
          secretAccessKey: apiConfig.secrets.BIN_DATA_API_SECRET_KEY,
        },
      });
    
      const payload = {
        body: JSON.stringify({ bin: bin , cpysource: cpySource}),
      };
    
      const command = new InvokeCommand({
        FunctionName: apiConfig.secrets.BIN_DATA_API_FUNCTION,
        Payload: new TextEncoder().encode(JSON.stringify(payload)),
      });
     
      try {
        const response = await client.send(command); 
         const decoded = new TextDecoder().decode(response.Payload); 
        return res.send(decoded);
      } catch (err) {
        console.error('Error invoking Lambda function:', err);
        return res.status(500).send({ message: 'Hotels userAccountHistory API call failed', error: err.message });
      }

});

//NG Offline Booking
router.post('/ngOfflineBooking', async (req: Request, res: Response) => {

  const { obj, offlineBookingurl } = req.body;
  console.log("----lamda req body--->>>", req.body);
  if (!obj) {
    return res.status(400).send({ message: 'Card Number is required.' });
  }
  const client = new LambdaClient({
        region: apiConfig.secrets.BIN_DATA_API_REGION,
        credentials: {
          accessKeyId: apiConfig.secrets.BIN_DATA_API_ACCESS_KEY,
          secretAccessKey: apiConfig.secrets.BIN_DATA_API_SECRET_KEY,
        },
      });
    
      const payload = {
        body: JSON.stringify(obj),
      };
    
       const command = new InvokeCommand({
        FunctionName: offlineBookingurl,
        Payload: new TextEncoder().encode(JSON.stringify(payload)),
      });
    
      console.log("----command--->>>", command);
      try {
        const response = await client.send(command);
        console.log("----response--->>>", response.Payload);
        return res.send(response.Payload);
      } catch (err) {
        console.error('Error invoking Lambda function:', err);
        return res.status(500).send({ message: 'lamda API call failed', error: err.message });
      }

});

// Retriving the  deals from butter cms
router.post('/buttercms-carousel', async (req: Request, res: Response) => {
 const { collection, locale } = req.body; 

  if (!collection || !locale) {
    return res.status(400).send({ message: 'Missing required params: collection or locale' });
  }

  try {
    const response = await butter.content.retrieve([collection], { locale });
    const items = response?.data?.data?.[collection]?.[0]?.carousel_items || []; 
    return res.status(200).send({ data: items });
  } catch (err) {
    console.error('ButterCMS API error:', err);
    return res.status(500).send({ message: 'Failed to fetch content from ButterCMS', error: err.message });
  }
});

// Retriving the faqs from butter cms
router.post('/buttercms-faq-page', async (req: Request, res: Response) => {
  const { pageType = '*', pageSlug, locale = 'en-za' } = req.body;

  if (!pageSlug) {
    return res.status(400).json({ message: 'pageSlug is required' });
  }

  try {
    const response = await butter.page.retrieve(pageType, pageSlug, { locale, preview: 1 });
    const faqData = response?.data?.data?.fields?.question_accordion?.qa || [];
    res.status(200).json({ data: faqData });
  } catch (error) {
    console.error('ButterCMS FAQ page fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch FAQ content', error: error.message });
  }
});


// Retriving the member deals from butter cms
router.post('/buttercms-member-deals', async (req: Request, res: Response) => {
  const { locale = 'en-za', page = 1, page_size = 10 } = req.body;
   
  try {
    const response = await butter.content.retrieve(['ts_landing_page'], {
      page,
      page_size,
      locale,
    });

    const carouselItems = response?.data?.data?.ts_landing_page?.[0]?.carousel_items || [];
   
    res.status(200).json({ data: carouselItems });
  } catch (error) {
    console.error('ButterCMS member deals fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch member deals', error: error.message });
  }
});


// Proxy Freshdesk APIs

// Get Email Config
router.get('/freshdesk/email-config', async (req, res) => {
  try {
    const response = await axios.get(`${apiConfig.freshDesk}/email_configs`, {
      headers: { Authorization: `Bearer ${apiConfig.secrets.FRESH_DESK_AUTHORIZATION_KEY}` }
    });
    res.send(response.data);
  } catch (error: any) {
    res.status(500).send({ message: 'Freshdesk email config failed', error: error.message });
  }
});

// Create Ticket
router.post('/freshdesk/create-ticket', async (req, res) => {
  try {
    const response = await axios.post(`${apiConfig.freshDesk}/tickets`, req.body, {
      headers: {
        Authorization: `Bearer ${apiConfig.secrets.FRESH_DESK_AUTHORIZATION_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.send(response.data);
  } catch (error: any) {
    res.status(500).send({ message: 'Freshdesk create ticket failed', error: error.message });
  }
});

// Get Tickets by Email
router.get('/freshdesk/tickets/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const response = await axios.get(`${apiConfig.freshDesk}/tickets/?email=${email}`, {
      headers: { Authorization: `Bearer ${apiConfig.secrets.FRESH_DESK_AUTHORIZATION_KEY}` }
    });

    console.log('freshdesk emails', {
      url : `${apiConfig.freshDesk}/tickets?email=${email}`,
      headers: { Authorization: `Bearer ${apiConfig.secrets.FRESH_DESK_AUTHORIZATION_KEY}` }
    });
    res.send(response.data);
  } catch (error: any) {
    res.status(500).send({ message: 'Fetching tickets failed', error: error.message });
  }
});

// Get Ticket Info by ID
router.get('/freshdesk/ticket-details/:id', async (req, res) => {
  try {
    // const { id } = req.params;
    const ticketId = req.params.id;
    const query = req.query.include ? `?include=${req.query.include}` : '';
    const response = await axios.get(`${apiConfig.freshDesk}/tickets/${ticketId}${query}`, {
      headers: { Authorization: `Bearer ${apiConfig.secrets.FRESH_DESK_AUTHORIZATION_KEY}` }
    });
    res.send(response.data);
  } catch (error: any) {
    res.status(500).send({ message: 'Fetching ticket details failed', error: error.message });
  }
});


// POST: Create chat on Freshdesk ticket
router.post('/freshdesk/chat/:ticketId', async (req: Request, res: Response) => {
  const { ticketId } = req.params;
  try {
    const form = new FormData();

    // Append all fields from req.body to form-data
    for (const key in req.body) {
      form.append(key, req.body[key]);
    }

    const url = `${apiConfig.freshDesk}/tickets/${ticketId}/reply`;

    const response = await axios.post(url, form, {
      headers: {
        'content-type': 'multipart/form-data',
        Authorization: `Bearer ${apiConfig.secrets.FRESH_DESK_AUTHORIZATION_KEY}`
      }
    });
    return res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Freshdesk chat proxy error:', error.message);
    return res.status(500).send({
      message: 'Failed to create Freshdesk chat',
      error: error?.response?.data || error.message
    });
  }
});

/**Resend Ticekt */
router.put('/resend-ticket/:reference', async (req: Request, res: Response) => {
  const { reference } = req.params;
  const ticketData = req.body;

  const resendUrl = `${apiConfig.webApiUrl}/website-services/api/itinerary/eTicket/${reference}?deliveryChannel=email`;

  try {
    const response = await axios.put(resendUrl, ticketData, {
      headers: {
        Authorization: `Bearer ${apiConfig.resendTicketToken}`,
        'Content-Type': 'application/json;charset=UTF-8'
      }
    });

    return res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Resend ticket failed:', error.message);
    return res.status(500).send({
      message: 'Failed to resend ticket',
      error: error?.response?.data || error.message,
    });
  }
});


router.delete('/account/delete', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  const backendUrl = `${apiConfig.baseUrl}/api/v3/account`;

  try {

    const headers: Record<string, string> = {
      'Content-Type': 'application/json;charset=UTF-8',
    };

    const options = {
      headers: headers,
      body: {
        token:token
      },
    };

    const response = await axios.delete(backendUrl, options);

    return res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Account deletion failed:', error.message);
    return res.status(500).send({
      message: 'Failed to delete account',
      error: error?.response?.data || error.message,
    });
  }
});

// cancel hotels my bookings
router.post('/hotel/cancel-booking', async (req: Request, res: Response) => {

  const token = getHotelTokenFromCookies(req);
  if (!token) return res.status(401).send({ message: 'Not authorized' });

  if (!req.body) {
    return res.status(400).send({ message: 'Missing token or booking data' });
  }

  const backendUrl = `${apiConfig.hotelsBaseUrl}/api/v2/cancelbooking`;

  try {
    const response = await axios.post(backendUrl, req.body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    return res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Hotel booking cancellation failed:', error.message);
    return res.status(500).send({
      message: 'Hotel booking cancellation failed',
      error: error?.response?.data || error.message,
    });
  }
});

// Iterable Token generation
router.post('/iterableJWTToken', async (req: Request, res: Response) => {

  const email = req.body?.payload?.email;
  const userID = req.body?.payload?.userId;

  if (!email && !userID) {
    return res.status(401).send({ message: 'Email and userID are required' });
  }

  const SECRET = apiConfig.secrets.ITERABLE_API_KEY_SHARED_SECRET;
  if (!SECRET) {
    return res.status(500).send({ message: 'Missing API_KEY_SHARED_SECRET in environment variables' });
  }

  const encoding = 'utf-8';
  const secret = Buffer.from(SECRET, encoding);

  const JWT_EXPIRATION_MINUTES = 60;
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + JWT_EXPIRATION_MINUTES * 60;

  // Step 1: Create JWT header and payload
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { userId: userID, iat, exp };

  // Step 2: Base64URL encode
  const base64urlEncode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(payload);

  const token = `${encodedHeader}.${encodedPayload}`;

  // Step 3: Sign the token
  const signature = crypto
    .createHmac('sha256', secret)
    .update(token)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${token}.${signature}`;

  return res.send({ token: jwt });
});

//Peach checkoutID creation
router.post('/peachCreateCheckoutID', async (req: Request, res: Response) => {
  const { email } = req.body;

  if ( !email) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const  currency = 'ZAR';
  const paymentType = 'DB';
  const amount = apiConfig.peachSubscriptionAmount;
  const entityId = apiConfig.peachEntityId;
  const authorizationToken = apiConfig.peachAuthorizationToken;
  const apiUrl = apiConfig.peachUrls;

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Bearer ${authorizationToken}`,
  };

  const payload = qs.stringify({
    entityId,
    amount,
    currency,
    paymentType,
    'customer.email': email,
  }); 
   
  try {
    const response = await axios.post(`${apiUrl}/v1/checkouts`, payload, { headers });
    res.json(response.data);
  } catch (error: any) {
    console.error('Checkout API error:', error?.response?.data || error.message);
    res.status(500).json({ message: 'Checkout failed', error: error.message });
  }
});

//Peach GetPaymentStatus
router.post('/getPaymentStatus', async (req: Request, res: Response) => {
  const { statusUrl } = req.body;
  if(!statusUrl){
     return res.status(500).send({ message: 'request url is required' });
  }
  const backendUrl = `${apiConfig.peachUrls}${statusUrl}?entityId=${apiConfig.peachEntityId}` 
  try {
    const response = await axios.get(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiConfig.peachAuthorizationToken}`
      }
    }); 
    return res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Peach payment status failed:', error.message);
    return res.status(500).send({
      message: 'Peach payment status failed',
    })
  }
});
// momentum family composition api
router.post('/family-composition', async (req: Request, res: Response) => {
  const sessionId = req.body?.sessionId;

  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' });
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: apiConfig.momentumBearerToken,
  };

  const payload = { sessionId };

  try {
    const backendUrl = `${apiConfig.baseUrl}/v1/user/multiply/family`;
    const response = await axios.post(backendUrl, payload, { headers });
    const responseData = response.data;

    const token = responseData?.data?.signinResponse?.token;

    if (token) storeTokenInCookie(token, res);
    return res.send(stripTokenFromResponse(responseData));

  } catch (error: any) {
    console.error('Error fetching family composition:', error.message);
    return res.status(500).json({
      message: 'Failed to fetch family composition',
      error: error?.response?.data || error.message,
    });
  }
});

//Peach reverse the payment when the subscription API throws error
router.post('/reversePayment', async (req: Request, res: Response) => {
  const { paymentId, paymentType } = req.body;

  if (!paymentId || !paymentType) {
    return res.status(400)  .send({ message: 'paymentId and paymentType are required' });
  }
   
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: apiConfig.peachAuthorizationToken,
  };

  const formData = new URLSearchParams();
  formData.append('entityId', apiConfig.peachEntityId || '');
  formData.append('paymentType', paymentType);

  const url = `${apiConfig.peachUrls}/v1/payments/${paymentId}`;

  try {
    const response = await axios.post(url, formData.toString(), { headers });
    res.status(200).send(response.data);
  } catch (error: any) {
    console.error('Error during capture authorization:', error.response?.data || error.message);
    res.status(500).send({
      message: 'Capture authorization failed',
      error: error.response?.data || error.message,
    })
  }
});

// absa to fetch user data from my-account 
router.post('/absa-user', async (req: Request, res: Response) => {
  const sessionId = req.body?.sessionId;

  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' });
  } 

  const body = {
    sessionId : sessionId
  };

  try {
    const backendUrl = `${apiConfig.baseUrl}/v1/user/absa`;
    const response = await axios.post(backendUrl, body);

    const responseData = response.data;

    const token = responseData?.data?.signinResponse?.token;

    if (token) storeTokenInCookie(token, res);
    return res.send(stripTokenFromResponse(responseData));

  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to fetch ABSA user details',
      error: err?.response?.data || err.message,
    });
  }
});

//Peach token logs
router.post('/tokenLogs', async (req: Request, res: Response) => {
  
  const apiURL = `${apiConfig.peachLogs}`;
  
  try {
    const {
      request,
      response: responseData, 
      apiType,
      channel,
      email,
      product,
    } = req.body;
    const api_type = apiConfig.peachUrls+apiType;
    const entityId = apiConfig.peachEntityId; // Keep it in .env file

    const requestParsed = JSON.parse(request);
    requestParsed['entityId'] = entityId;

    const logBody = {
      request: JSON.stringify(requestParsed),
      response: JSON.stringify(responseData),
      api_type,
      channel,
      email,
      product,
    };  
    const axiosResponse = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logBody),
    });

    const data = await axiosResponse.json(); 
    res.send(data);
  } catch (error) {
    console.error('Error logging token info:', error);
    res.status(500).json({ message: 'Log write failed', error });
  }
});

//Peach paymentStatusLogs
router.post('/paymentStatusLogs', async (req: Request, res: Response) => {
  
   const apiURL = `${apiConfig.peachLogs}`;
  
  try {
    const {
      request,
      response: responseData, 
      apiType,
      channel,
      email,
      product,
    } = req.body;
   
    const entityId = apiConfig.peachEntityId; // Keep it in .env file
    const api_type = `${apiType}?entityId=${entityId}`;
     

    const logBody = {
      request,
      response: responseData,
      api_type,
      channel,
      email,
      product,
    };  
    const axiosResponse = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logBody),
    });

    const data = await axiosResponse.json(); 
    res.send(data);
  } catch (error) {
    console.error('Error logging token info:', error);
    res.status(500).json({ message: 'Log write failed', error });
  }
});

// fetching walletn voucher balance
router.get('/wallet-vouchers', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req); 

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const currency = 'ZAR';
  const url = `${apiConfig.baseUrl}/api/v1/wallet/balance?token=${token}&currency=${currency}`;

  try {
    const result = await axios.get(url);
    return res.status(200).json(result.data);
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to fetch wallet vouchers',
      error: err?.response?.data || err.message,
    });
  }
});

// to validate the wallet voucher
router.post('/validate-wallet-voucher', async (req: Request, res: Response) => {
  const token = getTokenFromCookies(req);

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  const requestBody = {
    ...req.body,
    businessLoggedOnToken: token, 
  };

  // Build query string if any
  const queryParams = req.query;
  const queryString = new URLSearchParams(queryParams as Record<string, string>).toString();

  const url = `${apiConfig.webApiUrl}/website-services/api/validate-wallet-voucher/?${queryString}`;

  try {
    const result = await axios.post(url, requestBody);
    return res.status(200).json(result.data);
  } catch (err: any) {
    return res.status(500).json({
      message: 'Voucher validation failed',
      error: err?.response?.data || err.message,
    });
  }
});


router.post('/wallet-balance-update', async (req: Request, res: Response) => {

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiConfig.secrets.UPDATE_PWD_TOKEN}`,
  };

  const url = `${apiConfig.baseUrl}/api/v1/wallet/balance/update`;

  try {
    const response = await axios.post(url, req.body, { headers });
    return res.status(200).json(response.data);
  } catch (err: any) {
    return res.status(500).json({
      message: 'Wallet balance update failed',
      error: err?.response?.data || err.message,
    });
  }
});

// momentum redeem partner rewards
router.post('/redeemPartnerRewards', async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;

  if (!sessionId) {
    return res.status(400).json({ message: 'Missing session ID' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `${apiConfig.momentumBearerToken}`,
  };

  const url = `${apiConfig.mm_partnerProxyUrls}/redeemPartnerRewards?session_id=${sessionId}`;

  try {
    const response = await axios.post(url, req.body, { headers });
    return res.status(200).json(response.data);
  } catch (err: any) {
    return res.status(500).json({
      message: 'Redeem partner rewards failed',
      error: err?.response?.data || err.message,
    });
  }
});


// momentum refresh token
router.get('/refresh/session', async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;

  if (!sessionId) {
    return res.status(400).json({ message: 'Missing session_id' });
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `${apiConfig.momentumBearerToken}`,
    };

    const backendUrl = `${apiConfig.mm_partnerProxyUrls}/refresh/session?session_id=${sessionId}`;

    const result = await axios.get(backendUrl, { headers });

    return res.status(result.status).send(result.data);
  } catch (error: any) {
    return res.status(500).json({
      message: 'Session refresh failed',
      error: error.message || 'Unknown error',
    });
  }
});

// momentum GET partner rewards
router.post('/getPartnerRewards', async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  const payload = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: 'Missing session_id in query params' });
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `${apiConfig.momentumBearerToken}`,
    };

    const backendUrl = `${apiConfig.mm_partnerProxyUrls}/getPartnerRewards?session_id=${sessionId}`;

    const result = await axios.post(backendUrl, payload, { headers });

    return res.status(result.status).send(result.data);
  } catch (error: any) {
    return res.status(500).json({
      message: 'Failed to fetch partner rewards',
      error: error.message || 'Unknown error',
    });
  }
});

// momentum redeemption for meili
router.post('/momentumRedemption', async (req: Request, res: Response) => {
  const payload = req.body;

  try {
    const backendUrl = `${apiConfig.mm_partnerProxyUrls}/momentum/redeemPartnerRewards`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `${apiConfig.momentumBearerToken}`,
    };

    const result = await axios.post(backendUrl, payload, { headers });

    return res.status(result.status).send(result.data);
  } catch (err: any) {
    return res.status(500).json({
      message: 'Momentum redemption request failed',
      error: err.message || 'Unexpected error',
    });
  }
});

export default router;