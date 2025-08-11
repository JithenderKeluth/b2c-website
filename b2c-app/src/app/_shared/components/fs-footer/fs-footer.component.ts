import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fs-footer',
  templateUrl: './fs-footer.component.html',
  styleUrls: ['../../../_shared/components/footer/footer.component.scss'],
})
export class FsFooterComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  getPresentYear() {
    return new Date().getFullYear();
  }
}
