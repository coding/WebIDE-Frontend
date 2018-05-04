import React from 'react';
import ubuntu from '!raw-loader!./ubuntu.svg';
import node from '!raw-loader!./nodejs.svg';
import java from '!raw-loader!./java.svg';
import php from '!raw-loader!./php.svg';
import net from '!raw-loader!./dotnet.svg';
import elixir from '!raw-loader!./elixir.svg';
import machinelearning from '!raw-loader!./machinelearning.svg';
import jekyll from '!raw-loader!./jekyll.svg';
import ruby from '!raw-loader!./ruby.svg';
import hexo from '!raw-loader!./hexo.svg';
import share from '!raw-loader!./share.svg';

const svgs = { ubuntu, node, java, php, net, elixir, machinelearning, jekyll, ruby, hexo, share };

const match = (label) => {
	for (let key in svgs) {
		if (svgs.hasOwnProperty(key)) {
			if (label.indexOf(key) > -1) {
				return svgs[key];
			}
		}
	}
	return ubuntu;
}

export default (label = '') => {
	return <i className="env-icon" dangerouslySetInnerHTML={{ __html: match(label.toLowerCase()) }}></i>;
}
