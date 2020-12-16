import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import ApiService from '../api/api.service';
import { STATIC } from '../environment';

export default class PortfolioService {

	static all$() {
		if (STATIC) {
			return ApiService.staticGet$('/portfolio/stand/all').pipe(map(response => response.data));
		} else {
			return from([window.all]);
			//return ApiService.staticGet$('/portfolio/stand/all').pipe(map(response => response.data));
			// return ApiService.get$('/portfolio/stand/all').pipe(map(response => response.data));
		}
	}

	static filters$() {
		if (STATIC) {
			return ApiService.staticGet$('/portfolio/stand/filters').pipe(map(response => response.data));
		} else {
			return from([window.filters]);
			//return ApiService.staticGet$('/portfolio/stand/filters').pipe(map(response => response.data));
			// return ApiService.get$('/portfolio/stand/filters').pipe(map(response => response.data));
		}
	}

}
