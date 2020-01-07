import React from 'react';
import StyleButton from './StyleButton';

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
		{label: 'New age shit', style: 'new-age-shit'},
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

export default BlockStyleControls;