import { Component, getContext } from 'rxcomp';
import { FormControl, FormGroup, Validators } from 'rxcomp-form';
import { combineLatest, fromEvent } from 'rxjs';
import { delay, first, takeUntil, tap } from 'rxjs/operators';
import { STATIC } from '../environment';
import { FilterMode } from '../filter/filter-item';
import FilterService from '../filter/filter.service';
import LocationService from '../location/location.service';
import SearchService from './search.service';

const ITEMS_PER_PAGE = 9;

export default class SearchComponent extends Component {

	onInit() {
		const form = this.form = new FormGroup({
			search: new FormControl(LocationService.get('search'), Validators.RequiredValidator()),
		});
		const controls = this.controls = form.controls;
		this.maxVisibleItems = ITEMS_PER_PAGE;
		this.visibleItems = [];
		this.items = [];
		this.filters = {};
		this.onSearch();
	}

	load$() {
		return combineLatest([
			SearchService.all$(),
			SearchService.filters$(),
		]);
	}

	onSearch() {
		if (this.form.valid) {
			this.busy = true;
			this.items = [];
			this.filters = {};
			this.pushChanges();
			this.load$(this.form.value.search).pipe(
				delay(STATIC ? 1000 : 1),
				first(),
			).subscribe(data => {
				this.busy = false;
				this.items = data[0];
				this.filters = data[1];
				this.onSearchResults();
				this.pushChanges();
				LocationService.set('search', this.form.value.search);
			});
		} else {
			this.form.touched = true;
		}
	}

	onSearchResults() {
		const items = this.items;
		const filters = this.filters;
		Object.keys(filters).forEach(key => {
			filters[key].mode = FilterMode.SELECT;
		});
		const initialParams = {};
		const filterService = new FilterService(filters, initialParams, (key, filter) => {
			switch (key) {
				case 'category':
					filter.filter = (item, value) => {
						return item.category.id === value;
					};
				break;
				case 'year':
					filter.filter = (item, value) => {
						return item[key] === value;
					};
				break;
			}
		});
		this.filterService = filterService;
		this.filters = filterService.filters;
		filterService.items$(items).pipe(
			takeUntil(this.unsubscribe$),
		).subscribe(items => {
			this.maxVisibleItems = ITEMS_PER_PAGE;
			this.items = items;
			this.visibleItems = items.slice(0, this.maxVisibleItems);
			this.pushChanges();
		});
		this.scroll$().pipe(
			takeUntil(this.unsubscribe$)
		).subscribe();
	}

	scroll$() {
		const { node } = getContext(this);
		return fromEvent(window, 'scroll').pipe(
			tap(() => {
				if (!this.busy && this.items.length > this.visibleItems.length) {
					const rect = node.getBoundingClientRect();
					if (rect.bottom < window.innerHeight) {
						this.busy = true;
						this.pushChanges();
						setTimeout(() => {
							this.busy = false;
							this.maxVisibleItems += ITEMS_PER_PAGE;
							this.visibleItems = this.items.slice(0, this.maxVisibleItems);
							this.pushChanges();
						}, 1000);
					}
				}
			})
		);
	}

	toggleFilter(filter) {
		Object.keys(this.filters).forEach(key => {
			const f = this.filters[key];
			if (f === filter) {
				f.active = !f.active;
			} else {
				f.active = false;
			}
		});
		this.pushChanges();
	}

	clearFilter(event, filter) {
		event.preventDefault();
		event.stopImmediatePropagation();
		filter.clear();
		this.pushChanges();
	}
}

SearchComponent.meta = {
	selector: '[search]',
};
