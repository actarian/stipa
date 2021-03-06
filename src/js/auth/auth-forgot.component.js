import { Component } from 'rxcomp';
import { FormControl, FormGroup, Validators } from 'rxcomp-form';
import { takeUntil } from 'rxjs/operators';
import UserService from '../user/user.service';

export default class AuthForgotComponent extends Component {

	onInit() {
		const form = new FormGroup({
			email: new FormControl(null, [Validators.RequiredValidator(), Validators.EmailValidator()]),
			checkRequest: window.antiforgery,
			checkField: ''
		});

		const controls = form.controls;
		this.controls = controls;

		form.changes$.pipe(
			takeUntil(this.unsubscribe$)
		).subscribe((changes) => {
			// console.log('AuthForgotComponent.form.changes$', changes, form.valid);
			this.pushChanges();
		});

		this.form = form;
		this.error = null;
		this.success = false;
	}

	test() {
		this.form.patch({
			email: 'jhonappleseed@gmail.com',
			checkRequest: window.antiforgery,
			checkField: ''
		});
	}

	reset() {
		this.form.reset();
	}

	onSubmit() {
		// console.log('AuthForgotComponent.onSubmit', 'form.valid', valid);
		if (this.form.valid) {
			// console.log('AuthForgotComponent.onSubmit', this.form.value);
			this.form.submitted = true;
			UserService.retrieve$(this.form.value)
				.subscribe(response => {
					console.log('AuthForgotComponent.onSubmit', response);
					this.sent.next(true);
					this.success = true;
					// this.form.reset();
					this.pushChanges();
				}, error => {
					console.log('AuthForgotComponent.error', error);
					this.error = error;
					this.pushChanges();
				});
		} else {
			this.form.touched = true;
		}
	}

	onLogin() {
		this.login.next();
	}

	onRegister() {
		this.register.next();
	}

}

AuthForgotComponent.meta = {
	selector: '[auth-forgot]',
	outputs: ['sent', 'login', 'register'],
};
