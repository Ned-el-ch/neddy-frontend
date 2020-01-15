import React, { Component } from 'react';
import SmallPost from '../components/SmallPost';

export default class CategoryPage extends Component {
	state = {
		posts: null
	}
	getPosts = () => {
		fetch(`http://localhost:4000/category/${this.props.match.params.title}`)
		.then(res => res.json())
		.then(posts => this.setState({posts}))
		// .catch(error => console.log(error))
	}

	componentDidMount() {
		// debugger
		this.getPosts();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.match.params.title !== prevProps.match.params.title) {
			this.getPosts()
		}
	}
	

	renderPosts = () => {

		if (!this.state.posts) {
			return (<h3>Loading posts hehe</h3>)
		} else if (this.state.posts.status >= 400 || this.state.posts.error) {
			return (<h3>There doesn't seem to be anything here damn</h3>)
		} else {
			// debugger
			if (this.state.posts.length === 0) {
				return(<h3>This category doesn't have any posts yet</h3>)
			} else {
				return this.state.posts.map(postData => {
					return (<SmallPost postData={postData} user={this.props.user}/>)
				})
			}
		}
	}
	
	render() {
		return (
			<div>
				<h1>{this.props.match.params.title.toUpperCase()}</h1>
				{this.renderPosts()}
			</div>
		);
	}
}