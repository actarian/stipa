import { Component, getContext } from 'rxcomp';
// import { takeUntil } from 'rxjs/operators';
// import { BreakpointService } from './breakpoint/breakpoint.service';

export default class AppComponent extends Component {

	onInit() {
		const { node } = getContext(this);
		node.classList.remove('hidden');
		/*
		BreakpointService.observe$({
			isMobile: '(max-width: 767px)'
		}).pipe(
			takeUntil(this.unsubscribe$),
		).subscribe(results => {
			console.log('AppComponent.BreakpointService.results', results);
			this.isMobile = results.isMobile;
			this.pushChanges();
		});
		*/
	}
}

AppComponent.meta = {
	selector: '[app-component]',
};
