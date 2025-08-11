import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MyAccountServiceService } from '../my-account-service.service';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';

@Component({
  selector: 'app-query-record',
  templateUrl: './query-record.component.html',
  styleUrls: ['./query-record.component.scss'],
})
export class QueryRecordComponent implements OnInit {
  newMsg = new UntypedFormControl('');
  credentials: any;
  ticketId: any;
  user_Id: any;
  chatDeskData: any;
  fileToUpload: File | null = null;
  selectedFiles: FileList;
  public attachmentsval: any = [];
  allTickets: any;
  ticket = new UntypedFormControl('');
  msgdesc: any;
  test = 'hi team i request to &nbsp; to have change to get coffe &nbsp; with u in ur time are u free now &nbsp;';
  @Input() set queryIdVal(val: any) {
    if (val) {
      this.ticketId = val;
      this.getTicketInfo();
    }
  }
  @Output() queryDesc: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private location: Location,
    private myAccountService: MyAccountServiceService,
    private router: ActivatedRoute,
    private storage: UniversalStorageService
  ) {}

  ngOnInit(): void {
    this.getAgentText(this.test);
    // this.ticketId = this.queryIdVal;
    // this.ticket.setValue(this.queryIdVal);
    if (this.storage.getItem('credentials', 'session')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'session'));
    } else if (this.storage.getItem('credentials', 'local')) {
      this.credentials = JSON.parse(this.storage.getItem('credentials', 'local'));
    }
    this.getAllTickets();
    this.router.queryParams.subscribe((x) => {
      if (x && x.id) {
        this.ticketId = x.id;
        this.getTicketInfo();
      }
    });
  }
  gotoBack() {
    this.location.back();
  }
  sendMsg() {
    this.createNewMsg();
  }
  getAllTickets() {
    if (this.credentials) {
      this.myAccountService.getAllTicketsByEmail(this.credentials.data.contactInfo.email).subscribe((data: any) => {
        if (!data.code) {
          this.allTickets = data;
          this.getTicketInfo();
        }
      });
    }
  }
  getTicketInfo() {
    this.myAccountService.getTicketInfoById(this.ticketId).subscribe((data: any) => {
      if (!data.code) {
        this.user_Id = data.requester_id;
        this.msgdesc = data.description_text;
        this.queryDesc.emit(data.description_text);
        // this.chatDeskData=data.conversations;
        // if(data.conversations.length==0){
        //   this.newMsg.setValue(this.msgdesc);
        //   this.createNewMsg();
        // }
        this.groupingData(data.conversations);
      }
    });
  }
   
  selectTicket(ticketId: any) {
    this.ticketId = ticketId;
    this.ticket.setValue(ticketId);
    this.getTicketInfo();
  }
  createNewMsg() {
    if (this.newMsg.value || this.attachmentsval.length != 0) {
      let reqChat = {
        body: this.newMsg.value,
        user_id: this.user_Id,
        attachments: this.attachmentsval,
      };
      this.myAccountService.createFreshDeskChat(this.ticketId, reqChat).subscribe((data: any) => {
        this.newMsg.reset();
        if (!data.code) {
          this.getTicketInfo();
        }
      });
    }
  }
  groupingData(data: any) {
    const groups = data.reduce((groups: any, chat: any) => {
      const date = chat.created_at.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(chat);
      return groups;
    }, {});

    // Edit: to add it in the array format instead
    this.chatDeskData = Object.keys(groups).map((date) => {
      return {
        date,
        chat: groups[date],
      };
    });
  }
  getAgentText(data: any) {
    if (data && data.includes('&nbsp;')) {
      return data.replace('&nbsp;', '');
    } else {
      return data;
    }
  }
}
