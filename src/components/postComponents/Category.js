import React, { Component } from 'react';
import { Link } from "react-router-dom"
export default class Category extends Component {
	render() {
		return (
			<div className="post-category">
				<Link to={`/category/${this.props.category.title}`}><h5>{this.props.category.title}</h5></Link>
			</div>
		);
	}
}