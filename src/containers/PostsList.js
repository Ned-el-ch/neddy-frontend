import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import randKey from "../concerns/randomKey"

export default class PostsList extends Component {

	renderPostLinks = () => {
		// debugger
		return this.props.posts.map((postData) => {
			return (
				<Fragment>
					<Link to={`/posts/${postData.id}`} key={randKey()}>Post number {postData.id}</Link>
					<br/>
				</Fragment>
			)
		})
	}

	render() {
		return (
			<Fragment>
				{this.renderPostLinks()}
			</Fragment>
		);
	}
}