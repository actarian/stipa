import { map } from 'rxjs/operators';
import ApiService from '../api/api.service';
import { STATIC } from '../environment';

export default class SearchService {

	static all$() {
		if (STATIC) {
			return ApiService.staticGet$('/search/all').pipe(map(response => response.data));
		} else {
			// return from([window.all]);
			return ApiService.staticGet$('/search/all').pipe(map(response => response.data));
			// return ApiService.get$('/search/all').pipe(map(response => response.data));
		}
	}

	static filters$() {
		if (STATIC) {
			return ApiService.staticGet$('/search/filters').pipe(map(response => response.data));
		} else {
			// return from([window.filters]);
			return ApiService.staticGet$('/search/filters').pipe(map(response => response.data));
			// return ApiService.get$('/search/filters').pipe(map(response => response.data));
		}
	}

}
