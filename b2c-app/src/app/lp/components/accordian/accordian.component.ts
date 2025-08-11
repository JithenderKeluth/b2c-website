import { Component, OnInit, Input } from '@angular/core';
// import { marked } from 'marked';

@Component({
  selector: 'lp-accordian',
  templateUrl: './accordian.component.html',
  styleUrls: ['./accordian.component.scss'],
})
export class AccordianComponent implements OnInit {
  @Input() items: Array<{ header?: string; content?: string; expanded?: boolean }> = [];
  ngOnInit(): void {
    // set first item to expanded
    if (this.items.length > 0) {
      this.items[0].expanded = true;
    }
    // convert markdown to html, loop through items and convert markdown to html
    for (let i = 0; i < this.items.length; i++) {
      // this.items[i].content = marked.parse(this.items[i].content);
    }
  }
  toggleAccordian(item: any): void {
    // set other items to false
    this.items.forEach((i: any) => {
      if (i !== item) {
        i.expanded = false;
      }
    });
    // toggle the item
    item.expanded = !item.expanded;
  }
}
