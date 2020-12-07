import { Component, getContext } from 'rxcomp';
import { fromEvent, merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import DragService, { DragDownEvent, DragMoveEvent, DragUpEvent } from '../drag/drag.service';
import IntersectionService from '../intersection/intersection.service';

export const SliderAutoplayMode = {
	None: 0,
	Autoplay: 1,
	FocusAutoplay: 2,
};

export default class SliderComponent extends Component {

	get current() { return this.getCurrent(); }
	set current(current) { this.setCurrent(current); }

	getCurrent() {
		if (!this.state) {
			this.state = { current: 0 };
		}
		// console.log('SliderComponent.get.current', this.state.current);
		return this.state.current;
	}
	setCurrent(current = 0) {
		// console.log('SliderComponent.setCurrent', current);
		if (!this.state) {
			this.state = { current: 0 };
		}
		if (this.state.current !== current) {
			this.state.current = current;
			this.change.next(current);
		}
	}

	get wrapperStyle() {
		return { 'transform': 'translate3d(' + -100 * this.current + '%, 0, 0)' };
	}

	get innerStyle() {
		return { 'width': 100 * this.items.length + '%' };
	}

	get active() {
		return this.active_;
	}
	set active(active) {
		if (this.active_ !== active) {
			this.active_ = active;
			active ? this.onActivate() : this.onDeactivate();
		}
	}
	onActivate() {
		// console.log('SliderComponent.onActivate');
		this.checkAutoplay();
	}
	onDeactivate() {
		// console.log('SliderComponent.onDeactivate');
		this.userGesture = false;
		this.disableAutoplay();
	}

	get mobile() {
		return this.mobile_;
	}
	set mobile(mobile) {
		if (this.mobile_ !== mobile) {
			this.mobile_ = mobile;
			this.checkFocusAutoplay();
		}
	}
	get over() {
		return this.over_;
	}
	set over(over) {
		if (this.over_ !== over) {
			this.over_ = over;
			this.checkFocusAutoplay();
		}
	}

	onInit() {
		const { node } = getContext(this);
		this.container = node;
		this.wrapper = node.querySelector('.slider__wrapper');
		let items;
		if (node.hasAttribute('[items]')) {
			items = this.items || [];
		} else {
			items = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
		}
		this.items = items;
		// console.log('SliderComponent.onInit', this.items);
		this.userGesture = false;
		// this.userGesture$ = new Subject();
		setTimeout(() => {
			// this.change.next(this.current);
			/*
			gsap.set(this.wrapper, {
				x: -100 * this.current + '%',
			});
			*/
			this.slider$().pipe(
				takeUntil(this.unsubscribe$),
			).subscribe(event => {
				// console.log('dragService', event);
			});
		}, 1);
		this.changed$().pipe(
			takeUntil(this.unsubscribe$)
		).subscribe();
		this.intersect$(node).pipe(
			takeUntil(this.unsubscribe$),
		).subscribe();
		if (typeof this.focusAutoplay === 'number') {
			merge(this.resize$(), this.over$(node), this.leave$(node)).pipe(
				takeUntil(this.unsubscribe$),
			).subscribe();
		}
		/*
		this.autoplay$().pipe(
			takeUntil(this.unsubscribe$),
		).subscribe(() => {
			this.pushChanges();
		});
		*/
		setTimeout(() => {
			this.setActiveState();
		}, 500);
	}

	changed$() {
		return this.change.pipe(
			tap(() => {
				this.setActiveState();
				this.checkAutoplay();
			}),
		);
	}

	intersect$(node) {
		return IntersectionService.intersection$(node).pipe(
			tap(entry => this.active = entry.isIntersecting),
		);
	}

	resize$() {
		return fromEvent(window, 'resize').pipe(
			tap(() => this.mobile = window.innerWidth < 768),
		);
	}

	over$(node) {
		return fromEvent(node, 'mouseover').pipe(
			tap(() => this.over = true),
		);
	}

	leave$(node) {
		return fromEvent(node, 'mouseleave').pipe(
			tap(() => this.over = false),
		);
	}

	setActiveState() {
		const current = this.current;
		const { node } = getContext(this);
		const slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
		slides.forEach((slide, i) => {
			if (i === current) {
				slide.classList.add('active');
			} else {
				slide.classList.remove('active');
			}
		});
	}

	checkAutoplay() {
		this.disableAutoplay();
		let mode = SliderAutoplayMode.None;
		let autoplay = 0;
		if (typeof this.autoplay === 'number') {
			autoplay = this.autoplay;
			mode = SliderAutoplayMode.Autoplay;
		}
		if (typeof this.focusAutoplay === 'number') {
			autoplay = this.focusAutoplay;
			mode = SliderAutoplayMode.FocusAutoplay;
		}
		if (mode === SliderAutoplayMode.None) {
			return;
		}
		const current = this.current;
		const { node } = getContext(this);
		const slides = Array.prototype.slice.call(node.querySelectorAll('.slider__slide'));
		const currentSlide = slides[current];
		// console.log('SliderComponent.checkAutoplay', mode, this.active_, autoplay, currentSlide, node);
		if (currentSlide) {
			const video = currentSlide.querySelector('video');
			if (video) {
				const onEnded = () => {
					video.removeEventListener('ended', onEnded);
					if ((mode === SliderAutoplayMode.Autoplay && this.active_) ||
						(mode === SliderAutoplayMode.FocusAutoplay && ((this.mobile_ && this.active_) || (!this.mobile_ && this.over_)))) {
						// if (autoplay && !this.userGesture) {
						this.setCurrent((current + 1) % this.items.length);
						this.pushChanges();
					}
				};
				video.addEventListener('ended', onEnded);
				video.play();
			} else {
				if ((mode === SliderAutoplayMode.Autoplay && this.active_ && !this.userGesture) ||
					(mode === SliderAutoplayMode.FocusAutoplay && ((this.mobile_ && this.active_) || (!this.mobile_ && this.over_)))) {
					this.to = setTimeout(() => {
						this.setCurrent((current + 1) % this.items.length);
						this.pushChanges();
					}, autoplay);
				}
			}
		}
	}

	disableAutoplay() {
		if (this.to) {
			clearTimeout(this.to);
			this.to = null;
		}
		const { node } = getContext(this);
		const videos = Array.prototype.slice.call(node.querySelectorAll('video'));
		videos.forEach(video => {
			if (!video.paused) {
				video.pause();
			}
		});
		// console.log('SliderComponent.disableAutoplay', node);
	}

	checkFocusAutoplay() {
		if (this.mobile_) {
			if (this.active_) {
				this.checkAutoplay();
			} else {
				this.disableAutoplay();
			}
		} else {
			if (this.over_) {
				// this.checkAutoplay();
				// fire immediately !!!
				this.setCurrent((this.current + 1) % this.items.length);
				this.pushChanges();
			} else {
				this.disableAutoplay();
			}
		}
	}

	slider$() {
		let translation, dragDownEvent, dragMoveEvent;
		return DragService.events$(this.wrapper).pipe(
			tap((event) => {
				if (event instanceof DragDownEvent) {
					translation = this.getTranslation(this.wrapper, this.container);
					dragDownEvent = event;
				} else if (event instanceof DragMoveEvent) {
					dragMoveEvent = this.onDragMoveEvent(dragDownEvent, event, translation);
					// console.log('DragMoveEvent');
					/*
					if (Math.abs(dragMoveEvent.distance.x) > Math.abs(dragMoveEvent.distance.y)) {
						dragMoveEvent.originalEvent.preventDefault();
						dragMoveEvent.originalEvent.stopImmediatePropagation();
					}
					*/
				} else if (event instanceof DragUpEvent) {
					if (dragMoveEvent) {
						this.container.classList.remove('dragging');
						this.wrapper.style.transform = null;
						this.onDragUpEvent(dragDownEvent, dragMoveEvent);
					}
					// console.log('DragUpEvent');
				}
			})
		);
	}

	/*
	autoplay$() {
		if (this.autoplay) {
			const autoplay = typeof this.autoplay === 'number' ? this.autoplay : 4000;
			return interval(autoplay).pipe(
				takeUntil(this.userGesture$),
				tap(() => {
					this.setCurrent((this.current + 1) % this.items.length);
				}),
			);
		} else {
			return of(null);
		}
	}
	*/

	onDragMoveEvent(dragDownEvent, dragMoveEvent, translation) {
		this.container.classList.add('dragging');
		const transformX = translation.x + dragMoveEvent.distance.x;
		this.wrapper.style.transform = `translate3d(${transformX}px, ${0}px, ${0}px)`;
		return dragMoveEvent;
	}

	onDragUpEvent(dragDownEvent, dragMoveEvent) {
		const width = this.container.offsetWidth;
		if (dragMoveEvent.distance.x * -1 > width * 0.25 && this.hasNext()) {
			this.navTo(this.current + 1);
		} else if (dragMoveEvent.distance.x * -1 < width * -0.25 && this.hasPrev()) {
			this.navTo(this.current - 1);
		} else {
			this.wrapper.style.transform = `translate3d(${-100 * this.current}%, 0, 0)`;
		}
	}

	navTo(current) {
		current = (current > 0 ? current : this.items.length + current) % this.items.length;
		this.setCurrent(current);
		this.userGesture = true;
		// this.userGesture$.next();
		this.pushChanges();
	}

	hasPrev() {
		return this.current - 1 >= 0;
	}

	hasNext() {
		return this.current + 1 < this.items.length;
	}

	getTranslation(node, container) {
		let x = 0,
			y = 0,
			z = 0;
		const transform = node.style.transform;
		if (transform) {
			const coords = transform.split('(')[1].split(')')[0].split(',');
			x = parseFloat(coords[0]);
			y = parseFloat(coords[1]);
			z = parseFloat(coords[2]);
			x = coords[0].indexOf('%') !== -1 ? x *= container.offsetWidth * 0.01 : x;
			y = coords[1].indexOf('%') !== -1 ? y *= container.offsetHeight * 0.01 : y;
		}
		return { x, y, z };
	}
}

SliderComponent.meta = {
	selector: '[slider]',
	inputs: ['items', 'current', 'autoplay', 'focusAutoplay'],
	outputs: ['change', 'tween'],
};
