import React, { Component, PureComponent } from 'react';
import { registerComponent } from 'meteor/vulcan:core';
import { Accordion as SuiAccordion, Icon } from 'semantic-ui-react';

class Accordion extends Component {
  state = { activeIndex: -1 }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
  }

  renderTitle = (item, index) => {
    const { activeIndex } = this.state;

    return (
      <SuiAccordion.Title active={activeIndex === index} index={index} onClick={this.handleClick} key={'title.' + index}>
        <Icon name='dropdown' />
        {item.title}
      </SuiAccordion.Title>
    )
  }

  renderContent = (item, index) => {
    const { activeIndex } = this.state;

    return (
      <SuiAccordion.Content active={activeIndex === index} key={'content.' + index}>
        {item.content}
      </SuiAccordion.Content>
    )
  }

  render() {
    const { items, ...rest } = this.props;
    const itemElements = [];

    items.forEach((item, index) => {
      itemElements.push(this.renderTitle(item, index));
      itemElements.push(this.renderContent(item, index));
    })

    return (
      <SuiAccordion {...rest}>
        {itemElements}
      </SuiAccordion>
    )
  }
}

registerComponent('Accordion', Accordion);
