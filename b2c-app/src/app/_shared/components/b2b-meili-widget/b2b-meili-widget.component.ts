import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UniversalStorageService } from '@app/general/services/universal-storage.service';
declare const $:any;
@Component({
  selector: 'app-b2b-meili-widget',
  templateUrl: './b2b-meili-widget.component.html',
  styleUrls: ['./b2b-meili-widget.component.scss']
})
export class B2bMeiliWidgetComponent implements OnInit {

  constructor(private formBuilder : FormBuilder, private storage: UniversalStorageService) { }
  meiliContentForm : FormGroup;
  submitted : boolean = false;
  // B2B_meili_info :any = null;
  public B2B_meili_info: EventEmitter<any> = new EventEmitter();
  ngOnInit(): void {
    this.initForm();
    $('#meili-content_modal').modal('show');
  }
    initForm(){
      this.meiliContentForm = this.formBuilder.group({
        roseId : ['',[Validators.pattern('^([A-Za-z]|[0-9]|_)+$')]],
        AAN_Id : ['',[Validators.pattern('^([A-Za-z]|[0-9]|_)+$')]],
        iata : ['',[Validators.required,Validators.pattern('^([A-Za-z]|[0-9]|_)+$')]],
      })
    }
    updateMeiliWidget(){
      this.submitted = true;
      if(this.meiliContentForm.invalid){
        return;
      }else{
        const B2BUserInfo = JSON.parse(this.storage.getItem('b2bUser', 'session'))
        let meiliData:any = {
          additionalData : {
            roseId : this.meiliContentForm.get('roseId').value,
            avisAssignedNumber: this.meiliContentForm.get('AAN_Id').value
          },
          iataNumber: this.meiliContentForm.get('iata').value,
          corporateCode : B2BUserInfo?.customer_no || '',
          agentId : B2BUserInfo?.customer_no || '', 
        }
        this.B2B_meili_info.emit(meiliData);
        $('#meili-content_modal').modal('hide');
      }
    }
    ngOnDestroy() {
      $('#meili-content_modal').modal('hide');
    }
}
