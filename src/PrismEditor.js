import React, {Component} from "react";
import Draft from "draft-js";
import Prism from 'prismjs';
import Immutable from 'immutable';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
// import PrismDraftDecorator from 'draft-js-prism'
import "./rich.css";
import "./prism.css"

const {
	Editor,
	EditorState,
	RichUtils,
	// DefaultDraftBlockRenderMap,
	// Decorator
 } = Draft;
 const {
	//  Map,
	 List
} = Immutable;
 class PrismDraftDecorator {
	constructor(grammar) {
		this.grammar = grammar;
		this.highlighted = {};
	}
	getDecorations(block) {
		var blockType = block.getType();
		var blockKey = block.getKey();
		var blockText = block.getText();
		var decorations = Array(blockText.length).fill(null);
		this.highlighted[blockKey] = {};
		if (blockType !== 'code-block') {
		 return List(decorations);
		}
		var tokens = Prism.tokenize(blockText, this.grammar);
		var offset = 0;
		var that = this;
		tokens.forEach(function(tok) {
		 if (typeof tok === 'string') {
			offset += tok.length;
		 } else {
			var tokId = 'tok'+offset;
			var completeId = blockKey + '-' + tokId;
			that.highlighted[blockKey][tokId] = tok;
			occupySlice(decorations, offset, offset + tok.content.length, completeId);
			offset += tok.content.length;
		 }
		});
		return List(decorations);
	}
	getComponentForKey(key) {
		return function(props) {
		 return <span {...props} className={'token ' + props.tokType}>{props.children}</span>;
		}
	}
	getPropsForKey(key) {
		var parts = key.split('-');
		var blockKey = parts[0];
		var tokId = parts[1];
		var token = this.highlighted[blockKey][tokId];
		return {
		 tokType: token.type
		};
	}
 }
 function occupySlice(targetArr, start, end, componentKey) {
	for (var ii = start; ii < end; ii++) {
		targetArr[ii] = componentKey;
	}
 }
 export default class PrismEditor extends Component {
	constructor(props) {
		super(props);
		var decorator = new PrismDraftDecorator(Prism.languages.javascript);
		this.state = {
		 editorState: EditorState.createEmpty(decorator),
		};
		this.focus = () => this.refs.editor.focus();
		this.onChange = (editorState) => this.setState({editorState});
		this.handleKeyCommand = (command) => this._handleKeyCommand(command);
		this.toggleBlockType = (type) => this._toggleBlockType(type);
		this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
	}
	_handleKeyCommand(command) {
		const {editorState} = this.state;
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
		 this.onChange(newState);
		 return true;
		}
		return false;
	}
	_toggleBlockType(blockType) {
		this.onChange(
		 RichUtils.toggleBlockType(
			this.state.editorState,
			blockType
		 )
		);
	}
	_toggleInlineStyle(inlineStyle) {
		this.onChange(
			RichUtils.toggleInlineStyle(
				this.state.editorState,
				inlineStyle
			)
		);
	}
	render() {
		const {editorState} = this.state;
		// If the user changes block type before entering any text, we can
		// either style the placeholder or hide it. Let's just hide it now.
		let className = 'RichEditor-editor';
		var contentState = editorState.getCurrentContent();
		if (!contentState.hasText()) {
		 if (contentState.getBlockMap().first().getType() !== 'unstyled') {
			className += ' RichEditor-hidePlaceholder';
		 }
		}
		return (
			<Container><Row className="justify-content-md-center"><Col md="7">
				<div className="RichEditor-root">
					<BlockStyleControls
						editorState={editorState}
						onToggle={this.toggleBlockType}
					/>
					<InlineStyleControls
						editorState={editorState}
						onToggle={this.toggleInlineStyle}
					/>
					<div className={className} onClick={this.focus}>
						<Editor
						blockStyleFn={getBlockStyle}
						editorState={editorState}
						handleKeyCommand={this.handleKeyCommand}
						onChange={this.onChange}
						// placeholder="Tell a story..."
						ref="editor"
						spellCheck={true}
						/>
					</div>
				</div>
			</Col></Row></Container>
		);
	}
}
function getBlockStyle(block) {
	switch (block.getType()) {
		case 'blockquote': return 'RichEditor-blockquote';
		default: return null;
	}
}
class StyleButton extends Component {
	constructor() {
		super();
		this.onToggle = (e) => {
			e.preventDefault();
			this.props.onToggle(this.props.style);
		};
	}
	render() {
		let className = 'RichEditor-styleButton';
		if (this.props.active) {
			className += ' RichEditor-activeButton';
		}
		return (
			<span className={className} onMouseDown={this.onToggle}>
				{this.props.label}
			</span>
		);
	}
}
const BlockStyleControls = (props) => {
	const BLOCK_TYPES = [
		// {label: 'H1', style: 'header-one'},
		{label: 'Heading', style: 'header-two'},
		// {label: 'Sub-heading', style: 'header-three'},
		{label: 'Sub-heading', style: 'header-four'},
		// {label: 'H5', style: 'header-five'},
		// {label: 'H6', style: 'header-six'},
		{label: 'Blockquote', style: 'blockquote'},
		{label: 'Bullet List', style: 'unordered-list-item'},
		{label: 'Numbered List', style: 'ordered-list-item'},
		{label: 'JS Code Block', style: 'code-block'},
	];
	const {editorState} = props;
	const selection = editorState.getSelection();
	const blockType = editorState
		.getCurrentContent()
		.getBlockForKey(selection.getStartKey())
		.getType();
	return (
		<div className="RichEditor-controls">
			{BLOCK_TYPES.map((type) =>
				<StyleButton
					key={type.label}
					active={type.style === blockType}
					label={type.label}
					onToggle={props.onToggle}
					style={type.style}
				/>
			)}
		</div>
	);
};
const InlineStyleControls = (props) => {
	const INLINE_STYLES = [
		{label: 'Bold', style: 'BOLD'},
		{label: 'Italic', style: 'ITALIC'},
		{label: 'Underline', style: 'UNDERLINE'},
		{label: 'Monospace', style: 'CODE'},
	];
	const currentStyle = props.editorState.getCurrentInlineStyle();
	return (
		<div className="RichEditor-controls">
			{INLINE_STYLES.map(type =>
				<StyleButton
					key={type.label}
					active={currentStyle.has(type.style)}
					label={type.label}
					onToggle={props.onToggle}
					style={type.style}
				/>
			)}
		</div>
	);
};