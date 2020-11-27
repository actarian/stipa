import { CoreModule, Module } from 'rxcomp';
import { FormModule } from 'rxcomp-form';
import AppComponent from './app.component';
import AppearStaggerDirective from './appear/appear-stagger.directive';
import AppearDirective from './appear/appear.directive';
import AuthForgotComponent from './auth/auth-forgot.component';
import AuthModalComponent from './auth/auth-modal.component';
import AuthSigninComponent from './auth/auth-signin.component';
import AuthSignupComponent from './auth/auth-signup.component';
import AuthComponent from './auth/auth.component';
import ClickOutsideDirective from './click-outside/click-outside.directive';
import ContactsSimpleComponent from './contacts/contacts-simple.component';
import ContactsComponent from './contacts/contacts.component';
import DropdownItemDirective from './dropdown/dropdown-item.directive';
import DropdownDirective from './dropdown/dropdown.directive';
import ControlCheckboxComponent from './forms/control-checkbox.component';
import ControlCustomSelectComponent from './forms/control-custom-select.component';
import ControlPasswordComponent from './forms/control-password.component';
import ControlTextComponent from './forms/control-text.component';
import ControlTextareaComponent from './forms/control-textarea.component';
import ErrorsComponent from './forms/errors.component';
import GalleryModalComponent from './gallery/gallery-modal.component';
import GalleryComponent from './gallery/gallery.component';
import HeaderComponent from './header/header.component';
import HtmlPipe from './html/html.pipe';
import MagazineDropdownComponent from './magazine/magazine-dropdown.component';
import MagazineComponent from './magazine/magazine.component';
import ModalOutletComponent from './modal/modal-outlet.component';
import ModalComponent from './modal/modal.component';
import ScrollToDirective from './scroll-to/scroll-to.directive';
import SecureDirective from './secure/secure.directive';
import ShareComponent from './share/share.component';
import SliderCaseStudyComponent from './slider/slider-case-study.component';
import SliderGalleryComponent from './slider/slider-gallery.component';
import SliderHeroComponent from './slider/slider-hero.component';
import SliderComponent from './slider/slider.component';
import SlugPipe from './slug/slug.pipe';
import VirtualStructure from './virtual/virtual.structure';

export default class AppModule extends Module { }

AppModule.meta = {
	imports: [
		CoreModule,
		FormModule,
	],
	declarations: [
		AppearDirective,
		AppearStaggerDirective,
		AuthComponent,
		AuthForgotComponent,
		AuthModalComponent,
		AuthSigninComponent,
		AuthSignupComponent,
		ClickOutsideDirective,
		ContactsComponent,
		ContactsSimpleComponent,
		ControlCheckboxComponent,
		ControlCustomSelectComponent,
		ControlPasswordComponent,
		ControlTextComponent,
		ControlTextareaComponent,
		DropdownDirective,
		DropdownItemDirective,
		ErrorsComponent,
		GalleryComponent,
		GalleryModalComponent,
		HeaderComponent,
		HtmlPipe,
		MagazineComponent,
		MagazineDropdownComponent,
		ModalComponent,
		ModalOutletComponent,
		ScrollToDirective,
		SecureDirective,
		ShareComponent,
		SliderComponent,
		SliderCaseStudyComponent,
		SliderGalleryComponent,
		SliderHeroComponent,
		SlugPipe,
		VirtualStructure
	],
	bootstrap: AppComponent,
};
