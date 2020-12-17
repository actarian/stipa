import { Component, getContext } from 'rxcomp';

export default class YoutubeComponent extends Component {

	onInit() {
		const { node } = getContext(this);
		node.classList.add('youtube');
		node.innerHTML = /* html */ `
			<div class="picture--video">
				<iframe src="https://www.youtube.com/embed/${this.youtubeId}?vq=hd1080&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&color=white" width="560" height="315" frameborder="0"></iframe>
			</div>
		`;
	}

}

YoutubeComponent.meta = {
	selector: '[youtube-embed]',
	inputs: ['youtubeId'],
};
