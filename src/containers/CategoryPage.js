import React, { Component } from 'react';
import SmallPost from '../components/SmallPost';
import Loading from '../lotties/Loading';
import Programming from '../lotties/Programming';

export default class CategoryPage extends Component {
	state = {
		posts: null,
		open: false
	}
	getPosts = () => {
		fetch(`http://localhost:4000/category/${this.props.match.params.title}`)
		.then(res => res.json())
		.then(posts => this.setState({posts: posts, open: false}))
		.catch(console.log)

		// .catch(error => console.log(error))
	}

	componentDidMount() {
		// debugger
		this.getPosts();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.match.params.title !== prevProps.match.params.title) {
			// debugger
			this.getPosts()
			window.scrollTo(0, 0)
			// this.setState({open: false})

		}
	}

	// componentDidUpdate (prevProps, prevState) {
	// 	// debugger
	// 		if (prevProps.match !== this.props.match) {
	// 			debugger
	// 			this.setState({open: false})
	// 			window.scrollTo(0, 0)
	// 		}
	// }
	

	renderPosts = () => {

		if (!this.state.posts) {
			return (<Loading />)
		} else if (this.state.posts.status >= 400 || this.state.posts.error) {
			return (<h3>There doesn't seem to be anything here damn</h3>)
		} else {
			// debugger
			if (this.state.posts.length === 0) {
				return(<h3>This category doesn't have any posts yet</h3>)
			} else {
				return this.state.posts.map(postData => {
					// debugger
					return (<SmallPost postData={postData} user={this.props.user} open={this.state.open}/>)
				})
			}
		}
	}
	
	render() {
		return (
			<div>
				<h1>{this.props.match.params.title.toUpperCase()}</h1>
				{/* <Programming /> */}
				{this.renderPosts()}
			</div>
		);
	}
}