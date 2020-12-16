import { Component } from 'rxcomp';

let ACCORDION_UID = 0;

export default class AccordionComponent extends Component {

	onInit() {
		this.items = {};
	}

	register(item) {
		this.items[++ACCORDION_UID] = item;
	}

	unregister(item) {
		const uid = Object.keys(this.items).reduce((uid, key) => {
			if (this.items[key] === item) {
				return key;
			} else {
				return uid;
			}
		}, -1);
		if (uid !== -1) {
			delete this.items[uid];
		}
	}

	toggle(item) {
		Object.keys(this.items).forEach((key) => {
			const accordionItem = this.items[key];
			if (accordionItem === item) {
				accordionItem.active = !accordionItem.active;
			} else {
				accordionItem.active = false;
			}
		});
		this.pushChanges();
	}

}

AccordionComponent.meta = {
	selector: '[accordion]'
};
