import SessionStorageService from '../storage/session-storage.service';

export class CoverService {

	static isIndex() {
		const validPaths = ['', '/', '/it/', '/en/'];
		return validPaths.indexOf(window.location.pathname) !== -1;
	}

	static shouldShowCover() {
		let flag = false;
		const showCover = SessionStorageService.get('showCover');
		flag = CoverService.isIndex() && !showCover;
		SessionStorageService.set('showCover', true);
		return flag;
	}

}
