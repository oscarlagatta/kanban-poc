import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay} from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {

  // BreakpointObserver will give us access to an observable that listen to
  // different breakpoints depending on how we want to react
  // to different view port sizes. Handset is useful for desktop and mobile.
  isHandset$: Observable<boolean> = this.breakpointObserver.observe([Breakpoints.Handset])
    .pipe(
      map(result => result.matches), // maps the results of the breakpoint change,
                                    // because the result provides additional details beyond the matches to
                                    // that breakpoint we want to map it down to a single value
                                    // so we can use conditional logic in the template
      shareReplay() // because we will be subscribing to diff observables different times in the template using the async pipe
                    // and we want all those subscriptions are listening to the most recent values from the observable.
    )
  ;

  constructor(private breakpointObserver: BreakpointObserver) { }

  ngOnInit() {
  }

}
