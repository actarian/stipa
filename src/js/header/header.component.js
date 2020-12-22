import { Component, getContext } from 'rxcomp';
import { FormControl, FormGroup, Validators } from 'rxcomp-form';
import { takeUntil } from 'rxjs/operators';
import CssService from '../css/css.service';
// import UserService from '../user/user.service';

export default class HeaderComponent extends Component {

	onInit() {
		this.searchActive = false;
		this.mainActive = false;

		const form = this.form = new FormGroup({
			search: new FormControl(null, Validators.RequiredValidator()),
		});

		const controls = this.controls = form.controls;

		CssService.height$().pipe(
			takeUntil(this.unsubscribe$)
		).subscribe(height => {
			// console.log('HeaderComponent.height$', height);
		});
	}

	onSearch() {
		const { node } = getContext(this);
		const form = node.querySelector('form');
		const action = form.getAttribute('action');
		if (this.form.valid) {
			this.form.submitted = true;
			window.location.href = `${action}?search=${this.form.value.search}`;
		} else {
			this.form.touched = true;
		}
	}

	onMainToggle() {
		this.searchActive = false;
		this.mainActive = !this.mainActive;
		const { node } = getContext(this);
		const items = Array.prototype.slice.call(node.querySelectorAll('.nav--primary-menu > li'));
		gsap.to(items, {
			opacity: this.mainActive ? 1 : 0,
			duration: 0.35,
			stagger: {
				each: 0.05,
				ease: Power3.easeOut
			}
		});
		this.pushChanges();
	}

	onSearchToggle() {
		this.mainActive = false;
		this.searchActive = !this.searchActive;
		const { node } = getContext(this);
		/*
		const items = Array.prototype.slice.call(node.querySelectorAll('.nav--primary-menu > li'));
		gsap.to(items, {
			opacity: this.searchActive ? 1 : 0,
			duration: 0.35,
			stagger: {
				each: 0.05,
				ease: Power3.easeOut
			}
		});
		*/
		this.pushChanges();
	}

	onOpenSub(subId) {
		this.subId = subId;
		this.pushChanges();
	}

	onCloseSub(subId) {
		if (this.subId === subId) {
			this.subId = null;
			this.pushChanges();
		}
	}

	isSubOpen(subId) {
		return this.subId === subId;
	}

	isPrimaryHidden() {
		return this.subId != null;
	}

	onShowSub(subId) {
		this.showPictureOrDefault();
		if (window.innerWidth > 768) {
			this.subId = subId || null;
			this.pushChanges();
		}
	}

	showPicture(src) {
		const { node } = getContext(this);
		const picture = node.querySelector('.main-menu__picture');
		let img;
		if (src) {
			img = document.createElement('img');
			img.onload = () => {
				picture.appendChild(img);
				gsap.set(img, { opacity: 0 });
				gsap.to(img, {
					opacity: 1,
					duration: 0.35,
					overwrite: 'all',
					onComplete: () => {
						while(picture.childElementCount > 1) {
							picture.removeChild(picture.children[0]);
						}
					},
				});
			};
			img.src = src;
		} else {
			img = picture.querySelector('img');
			if (img) {
				gsap.to(img, {
					opacity: 0,
					duration: 0.35,
					overwrite: 'all',
					onComplete: () => {
						while(picture.childElementCount > 0) {
							picture.removeChild(picture.children[0]);
						}
					},
				});
			}
		}
	}

	showPictureOrDefault(src) {
		const { node } = getContext(this);
		const picture = node.querySelector('.main-menu__picture');
		let img = picture.querySelector('img');
		const defaultSrc = this.defaultSrc = (this.defaultSrc || img.getAttribute('src'));
		src = src || defaultSrc;
		if (!img || img.getAttribute('src') !== src) {
			img = document.createElement('img');
			img.onload = () => {
				picture.appendChild(img);
				gsap.set(img, { opacity: 0 });
				gsap.to(img, {
					opacity: 1,
					duration: 0.35,
					overwrite: 'all',
					onComplete: () => {
						while(picture.childElementCount > 1) {
							picture.removeChild(picture.children[0]);
						}
					},
				});
			};
			img.src = src;
		}
	}
}

HeaderComponent.meta = {
	selector: 'header'
};
