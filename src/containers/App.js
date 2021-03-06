import React, { Component, Fragment } from 'react';
import SignUpPage from './SignUpPage';
import LoginPage from './LoginPage';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom'
// import Posts from './DiscoverPage';
import BlogEditor from './BlogEditor';
import AuthorPage from './AuthorPage';
import HomeFeed from './HomeFeed';
import SmallPost from '../components/SmallPost';
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Nav from "react-bootstrap/Nav"
import Navbar from "react-bootstrap/Navbar"
import NavItem from "react-bootstrap/NavItem"
import NavLink from "react-bootstrap/NavLink"
import { LinkContainer } from "react-router-bootstrap";
import CategoryPage from './CategoryPage';
import ErrorPage from '../lotties/ErrorPage';
import DiscoverPage from './DiscoverPage';
import randKey from "../concerns/randomKey"
// ADD A MY PROFILE THING PAGE
// MAX TITLE SIZE
// CLEAR THE EDITOR BUTTON

export default class App extends Component {

	state = {
		user: null,
		posts: [],
		categories: [],
		feed: [],
		draft: null,
		randomKey: "fadag3fd"
	}

	handleLogin = (user) => {
		this.setState(
			{user}
		)
		this.getFeed()
	}

	checkIfLoggedIn = () => {
		// debugger
		if (localStorage.token) {
			fetch("https://agile-journey-79048.herokuapp.com/api/v1/profile", {
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: `Bearer ${localStorage["token"]}`
			}
			})
			.then(res => res.json())
			.then(res => {
				if (!res.message) {
					this.handleLogin(res)
				}
			})
			.catch(console.log)
		}
	}

	getPosts = () => {
		fetch("https://agile-journey-79048.herokuapp.com/posts")
		.then(res => res.json())
		.then(posts => this.setState({posts: posts}))
		.catch(console.log)
	}

	getFeed = () => {
		fetch("https://agile-journey-79048.herokuapp.com/api/v1/feed",{
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${localStorage["token"]}`
		}
		})
		.then(res => res.json())
		.then(this.parseFeed)
		.then(feed => this.setState({feed}))
		.catch(console.log)
	}

	parseFeed = (data) => {
		// debugger
		let feed = []
		let ids = []
		data.categories.map(category => {
			feed = [...feed, ...category.posts]
		})
		// debugger
		data.active_relationships.map(ar => {
			feed = [...feed, ...ar.followed_user.posts]
		})
		// debugger
		return feed.filter(post => {
			if (!ids.includes(post.id)) {
				ids.push(post.id)
				return post
			}
		})
		// debugger
	}

	getCategories = () => {
		fetch("https://agile-journey-79048.herokuapp.com/categories")
		.then(res => res.json())
		.then(this.mutateCategories)
	}

	getDraft = () => {
		if (localStorage["draftail:content"] && localStorage["draftail:content"] !== "null") {
			this.setState({draft: JSON.parse(localStorage["draftail:content"])}) 
		} else {
			this.setState({draft: null}) 
		}
	}

	mutateCategories = (rawCategories) => {
		const categories = rawCategories.map(category => {
			return {label: category.title, value: category.id}
		})

		this.setState({categories})
	}

	logout = (event) => {
		event.preventDefault()
		this.setState({user: null, feed: []})
		localStorage.token = ""
		localStorage["draftail:content"] = null

	}

	linksToRender = () => {
		if (this.state.user && this.state.user.id ) {
			return(
				<Fragment>
					<LinkContainer to="/editor">
						<NavLink><NavItem>New Post</NavItem></NavLink>
					</LinkContainer>
					<button onClick={this.logout} className='logout'>Log Out</button>
				</Fragment>
			)
		} else {
			return(
				<Fragment>
					<LinkContainer to="/login">
						<NavLink><NavItem>Login</NavItem></NavLink>
					</LinkContainer>
					<LinkContainer to="/signup">
						<NavLink><NavItem>Sign Up</NavItem></NavLink>
					</LinkContainer>
				</Fragment>
			)
		}
	}

	routesToRender = () => {
		if (this.state.user && this.state.user.id ) {
			return(
				<Fragment>
					<Route exact path='/editor' render={
						(routerProps) => < BlogEditor {...routerProps} userId={this.state.user.id} user={this.state.user} categories={this.state.categories}/>
						}
					/>
				</Fragment>
			)
		} else {
			return(
				<Fragment>
					<Route exact path='/signup' render={
							(routerProps) => < SignUpPage {...routerProps} handleLogin={this.handleLogin}/>
						}
					/>
					<Route exact path='/login' render={
							(routerProps) => < LoginPage {...routerProps} handleLogin={this.handleLogin}/>
						}
					/>
				</Fragment>
			)
		}
	}

	// clearEditor = () => {
	// 	let clear = confirm("Are you sure you want to clear everything?")
	// 	if (clear) {
	// 		this.setState({randomKey: randKey(), draft: null})
	// 	}
	// }

	componentDidMount() {
		this.checkIfLoggedIn()
		this.getPosts()
		this.getCategories()
		this.getFeed()
		this.getDraft()
	}

	render() {
		return (
			<div className='app'><Container fluid>
				{/* <button onClick={this.clearEditor}>oof</button> */}
				<Router>
				{/* <button onClick={this.getFeed}>OOF</button> */}
				<Navbar bg="light" variant="light" fixed>
					<Nav fluid="true" collapseOnSelect="true">
						<LinkContainer to="/">
							<NavLink><Navbar.Brand>
							<NavItem>{this.state.user ? "My Feed" : "Home"}</NavItem>
							</Navbar.Brand></NavLink>
						</LinkContainer>
						<Navbar.Collapse>
						<LinkContainer to="/discover">
							<NavLink><NavItem>Discover</NavItem></NavLink>
						</LinkContainer>
						{this.linksToRender()}
						</Navbar.Collapse>
					</Nav>
				</Navbar>
				<br/>
				<Row className="align-self-start justify-content-center">
					<Col  xs sm={11} md={9} lg={7} xl={6} className="col-xxl">
						<Switch>
							<Route exact path="/posts/:id" render={routerProps => {
								return <SmallPost {...routerProps} posts={this.state.posts} user={this.state.user}/>
							}} />
							<Route exact path="/authors/:username" render={routerProps => {
								return <AuthorPage {...routerProps} user={this.state.user}/>
							}} />
							<Route exact path="/category/:title" render={routerProps => {
								return <CategoryPage {...routerProps} user={this.state.user}/>
							}} />
							<Route exact path='/discover'	render={
									(routerProps) => < DiscoverPage {...routerProps} categories={this.state.categories} user={this.state.user}
								/>
								}
							/>
							<Route exact path="/dino" component={ErrorPage} />

							<Route exact path='/' render={
								(routerProps) => {
									return <HomeFeed
										{...routerProps}
										user={this.state.user}
										feed={this.state.feed}
										getFeed={this.getFeed}
									/>}
								}
							/>

							{this.state.user  ?
							<div>
								<Route exact path='/editor' render={
									(routerProps) => < BlogEditor {...routerProps} key={this.state.randomKey} userId={this.state.user.id} user={this.state.user} categories={this.state.categories} draft={this.state.draft}/>
									}
								/>
							</div>
							:
							<div>
								<Route exact path='/signup' render={
									(routerProps) => < SignUpPage {...routerProps} handleLogin={this.handleLogin}/>
								}
								/>
								<Route exact path='/login' render={
									(routerProps) => < LoginPage {...routerProps} handleLogin={this.handleLogin}/>
								}
								/>
							</div>
							}

							{/* <Route component={Dino}/> */}
							{/* <Redirect to='/404' /> */}
							{/* {this.routesToRender()} */}
						</Switch>
					</Col>
				</Row>
			</Router></Container></div>
		);
	};
};