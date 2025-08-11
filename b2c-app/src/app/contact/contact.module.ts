import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ContactUsFormComponent } from './contact-us-form/contact-us-form.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CustomMaterialModule } from './../custom-material/custom-material.module';
import { I18nModule } from './../i18n/i18n.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactRoutingModule } from './contact-routing.module';
import { ContactFaqComponent } from './contact-faq/contact-faq.component';
import { ChatWithUsComponent } from './chat-with-us/chat-with-us.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ContactFormComponent } from './contact-form/contact-form.component';

@NgModule({
  declarations: [ContactUsFormComponent, ContactFaqComponent, ChatWithUsComponent, ContactFormComponent],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    RouterModule,
    CustomMaterialModule,
    I18nModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    ContactRoutingModule,
    NgxIntlTelInputModule
  ],
  providers: [DatePipe, I18nModule],
  exports: [ContactUsFormComponent],
})
export class ContactModule {}
