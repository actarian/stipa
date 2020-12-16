import { Component } from 'rxcomp';
import AccordionComponent from './accordion.component';

export default class AccordionItemComponent extends Component {

	onInit() {
		if (!this.host) {
			throw ('missing Accordion host');
		}
		this.host.register(this);
		this.active = false;
	}

	onDestroy() {
		if (this.host) {
			this.host.unregister(this);
		}
	}

	onToggle() {
		if (this.host) {
			this.host.toggle(this);
		}
	}

}

AccordionItemComponent.meta = {
	selector: '[accordion-item]',
	hosts: { host: AccordionComponent },
};
