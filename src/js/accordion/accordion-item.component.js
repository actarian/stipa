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
			/*
			const { node } = getContext(this);
			const answer = node.querySelector('.answer');
			gsap.set(answer, { display: 'block' });
			const h = answer.getBoundingClientRect().height;
			gsap.set(answer, { height: this.active ? '0' : 'auto' });
			const height = this.active ? h : 0;
			console.log('height', height);
			gsap.to(answer, {
				height: height,
				duration: 0.25,
				onComplete: () => {
					setTimeout(() => {
						if (!this.active) {
							gsap.set(answer, {clearProps: 'all' });
						}
					}, 100);
				}
			});
			*/
		}
	}

}

AccordionItemComponent.meta = {
	selector: '[accordion-item]',
	hosts: { host: AccordionComponent },
};
