import { Component, getContext } from 'rxcomp';
import { FormControl, FormGroup, Validators } from 'rxcomp-form';
import { takeUntil } from 'rxjs/operators';
import HttpService from '../http/http.service';
import LocationService from '../location/location.service';

export default class ContactsSimpleComponent extends Component {

	onInit() {

		const contacts = Object.assign({
			firstName: null,
			lastName: null,
			email: null,
		}, (LocationService.deserialize('contacts') || {}));

		const form = new FormGroup({
			firstName: new FormControl(contacts.firstName, Validators.RequiredValidator()),
			lastName: new FormControl(contacts.lastName, Validators.RequiredValidator()),
			email: new FormControl(contacts.email, [Validators.RequiredValidator(), Validators.EmailValidator()]),
			// privacy: new FormControl(null, Validators.RequiredValidator()),
			checkRequest: window.antiforgery,
			checkField: '',
		});

		const controls = this.controls = form.controls;

		form.changes$.pipe(
			takeUntil(this.unsubscribe$)
		).subscribe((changes) => {
			this.pushChanges();
		});

		this.form = form;
		this.error = null;
		this.success = false;
	}

	test() {
		this.form.patch({
			firstName: 'Jhon',
			lastName: 'Appleseed',
			email: 'jhonappleseed@gmail.com',
			// privacy: true,
			checkRequest: window.antiforgery,
			checkField: ''
		});
	}

	reset() {
		this.form.reset();
	}

	onSubmit() {
		if (this.form.valid) {
			this.form.submitted = true;
			LocationService.serialize('contacts', this.form.value);
			const url = `${this.action}${window.location.search}`;
			window.location.href = url;
			return;
			HttpService.post$(this.action, this.form.value)
				.subscribe(response => {
					this.success = true;
					this.form.reset();
					// this.pushChanges();
					/*
					dataLayer.push({
						'event': 'formSubmission',
						'formType': 'Contacts'
					});
					*/
				}, error => {
					console.log('ContactsSimpleComponent.error', error);
					this.error = error;
					this.pushChanges();
				});
		} else {
			this.form.touched = true;
		}
	}

	get action() {
		const { node } = getContext(this);
		const form = node.querySelector('form');
		return form.getAttribute('action');
	}

}

ContactsSimpleComponent.meta = {
	selector: '[contacts-simple]',
	inputs: ['flag']
};
