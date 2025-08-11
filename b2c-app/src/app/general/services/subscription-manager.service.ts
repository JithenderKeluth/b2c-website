import { Injectable, Injector, ComponentFactoryResolver } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionManagerService {
  private subscriptionsMap: Map<any, Subscription[]> = new Map<any, Subscription[]>();

  constructor(private injector: Injector) { }

  start() {
    const componentFactoryResolver = this.injector.get(ComponentFactoryResolver);
    const originalCreateComponent = componentFactoryResolver.resolveComponentFactory.bind(componentFactoryResolver);
    componentFactoryResolver.resolveComponentFactory = (componentClass: any) => {
      const componentFactory = originalCreateComponent(componentClass);
      const originalCreate = componentFactory.create.bind(componentFactory);
      componentFactory.create = (...args: any[]) => {
        const componentRef = originalCreate(...args);
        this.trackComponentSubscriptions(componentRef.instance);
        const originalDestroy = componentRef.destroy.bind(componentRef);
        componentRef.destroy = () => {
          this.ngOnDestroyComponent(componentRef.instance);
          originalDestroy();
        };
        return componentRef;
      };
      return componentFactory;
    };
  }

  trackComponentSubscriptions(component: any) {
    const componentSubscriptions: Subscription[] = [];
    Object.getOwnPropertyNames(Object.getPrototypeOf(component)).forEach(property => {
      const value = component[property];
      if (value instanceof Observable && typeof value.subscribe === 'function') {
        const subscription = value.subscribe({
          complete: () => {
            const subscriptions = this.subscriptionsMap.get(component);
            if (subscriptions) {
              const index = subscriptions.indexOf(subscription);
              if (index !== -1) {
                subscriptions.splice(index, 1);
              }
            }
          }
        });
        componentSubscriptions.push(subscription);
      }
    });
    this.subscriptionsMap.set(component, componentSubscriptions);
  }

  ngOnDestroyComponent(component: any) {
    const subscriptions = this.subscriptionsMap.get(component);
    if (subscriptions) {
      subscriptions.forEach(subscription => subscription.unsubscribe());
      this.subscriptionsMap.delete(component);
    }
  }
}
