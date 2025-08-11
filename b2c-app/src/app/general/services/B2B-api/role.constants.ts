export const Roles = {
  superadmin: 1,
  tsemployee: 2,
  agent: 3,
  subagent: 4,
  staff: 5,
};

export const PERMISSIONS = {
  // Agent permissions
  myAccountAdmin: 1, // Permission for Staff Creation,Template Edit
  flightBookingFlowAdmin: 8, // Permission : Search,Profile,Booking,Edit Price
  flightSearch: 9, // Permission For Search Flight
  walletAdmin: 12, // Load money,Transtion View ,Download the Excel
  analyticsAdmin: 17, // All the dashbord api and tiles
  editflightprice: 19, // Edit the price on Booking flow
  markupAdmin: 20, // All markup action like create,edit and view
  logAdmin: 25, // All log data

  // TsEmployee permissions
  myAccountAdminTSE: 2, // Permission for Agent Creation, Template Adding, ts Employee creation, Approve the agent
  flightSearchTSE: 9, // Permission For Search Flight
  walletAdminTSE: 13, // Load money to agent,wallet Transtion of agents View ,Download the Excel
  analyticsAdminTSE: 18, // All the deshboard api and tiles
  logAdminTSE: 24, // All log data
  /**FS permissions */
  HOLD_AND_PAY : 26,
  PAYMENT_LINK : 27
};

export const isSuperAdmin = (userRole: any) => Boolean(userRole === Roles.superadmin);
export const isAgent = (userRole: any) => Boolean(userRole === Roles.agent);
export const isTsEmployee = (userRole: any) => Boolean(userRole === Roles.tsemployee);
export const isSubAgent = (userRole: any) => Boolean(userRole === Roles.subagent);
export const isStaff = (userRole: any) => Boolean(userRole === Roles.staff);
