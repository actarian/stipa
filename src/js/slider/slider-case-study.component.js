import { getContext } from 'rxcomp';
import { animationFrameScheduler, combineLatest, fromEvent, interval } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import SliderComponent from './slider.component';

export default class SliderCaseStudyComponent extends SliderComponent {

	get items() {
		return this.items_ || [];
	}
	set items(items) {
		if (this.items_ !== items) {
			this.items_ = items;
		}
	}

	get current() {
		return this.state.current || 0;
	}
	set current(current = 0) {
		if (this.state.current !== current) {
			this.state.current = current;
			this.change.next(current);
		}
	}

	get state() {
		if (!this.state_) {
			this.state_ = { current: 0 };
		}
		return this.state_;
	}

	get wrapperStyle() {
		const { node } = getContext(this);
		const slideWidth = (node.offsetWidth / 12 * 10) + 40;
		return { 'transform': 'translate3d(' + -slideWidth * this.state.current + 'px, 0, 0)' };
	}

	get innerStyle() {
		const { node } = getContext(this);
		const slideWidth = (node.offsetWidth / 12 * 10) + 40;
		// const slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
		return { 'width': slideWidth * this.items.length + 'px' };
	}

	onInit() {
		super.onInit();
		this.changed$().pipe(
			takeUntil(this.unsubscribe$)
		).subscribe();
		setTimeout(() => {
			this.setActiveState();
		}, 500);
	}

	set direction(direction) {
		if (this.direction_ !== direction) {
			this.direction_ = direction;
			const { node } = getContext(this);
			const pagination = node.querySelector('.slider__pagination');
			if (direction == 1) {
				pagination.classList.remove('prev');
				pagination.classList.add('next');
			} else {
				pagination.classList.remove('next');
				pagination.classList.add('prev');
			}
		}
	}

	raf$() {
		return interval(0, animationFrameScheduler);
	}

	mouse$() {
		const event = { x:0, y: 0};
		return fromEvent(window, 'mousemove').pipe(
			map(mouseEvent => {
				event.x = mouseEvent.clientX;
				event.y = mouseEvent.clientY;
				return event;
			}),
		);
	}

	pagination$() {
		const { node } = getContext(this);
		const position = { x:0, y: 0};
		const pagination = node.querySelector('.slider__pagination');
		return combineLatest([this.mouse$(), this.raf$()]).pipe(
			tap(datas => {
				const mouse = datas[0];
				position.x += (mouse.x - position.x) / 20;
				position.y += (mouse.y - position.y) / 20;
				// const rect = node.getBoundingClientRect();
				this.direction = mouse.x > window.innerWidth / 2 ? 1 : -1;
				pagination.style.transform = `translateX(${position.x}px) translateY(${position.y}px)`;
			}),
		);
	}

	click$() {
		const { node } = getContext(this);
		return fromEvent(node, 'click').pipe(
			map(event => {
				if (event.clientX > window.innerWidth / 2) {
					// if (this.hasNext()) {
						this.navTo(this.state.current + 1);
					// }
				} else {
					// if (this.hasPrev()) {
						this.navTo(this.state.current - 1);
					// }
				}
			}),
		);
	}

	changed$() {
		return this.change.pipe(
			tap(() => this.setActiveState()),
		);
	}

	setActiveState() {
		const current = this.current;
		const { node } = getContext(this);
		const slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
		slides.forEach((slide, i) => i === current ? slide.classList.add('active') : slide.classList.remove('active'));
	}

	onContentOver() {
		const { node } = getContext(this);
		node.classList.add('content-over');
	}

	onContentOut() {
		const { node } = getContext(this);
		node.classList.remove('content-over');
	}

	navTo(current) {
		super.navTo(current);
	}
}

SliderCaseStudyComponent.meta = {
	selector: '[slider-case-study]',
	inputs: ['items', 'current', 'autoplay'],
	outputs: ['change', 'tween'],
};
