import PropTypes from 'prop-types'
import React from 'react'
import styled, { css } from 'styled-components'
// components
import List from './list'
// constants
import themeConst from '../../constants/theme'
import typography from '../../constants/typography'
import color from '../../constants/color'
// @twreporter
import mq from '@twreporter/core/lib/utils/media-query'
// lodash
import debounce from 'lodash/debounce'
import get from 'lodash/get'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
const _ = {
  debounce,
  get,
  map,
  sortBy,
}

const _articleStyles = {
  interactive: 'interactive',
}

const Block = styled.section`
  ${mq.desktopAndAbove`
    display: flex;
  `}

  ${mq.desktopOnly`
    margin-left: 28px;
  `}

  ${mq.hdOnly`
    margin-left: 53px;
  `}
`

const Descriptor = styled.div`
  ${props => {
    switch (props.theme.name) {
      case themeConst.article.v2.photo:
        return css`
          color: ${color.gray5};
          ${mq.desktopAndAbove`
            border-color: ${color.gray10};
            &::after {
              border-color: ${color.gray10};
            }
          `}
        `
      case themeConst.article.v2.pink:
      case themeConst.article.v2.default:
      default:
        return css`
          color: ${color.gray80};
          ${mq.desktopAndAbove`
            border-color: ${color.gray50};
            &::after {
              border-color: ${color.gray50};
            }
          `}
        `
    }
  }}

  ${mq.tabletAndBelow`
    margin: 0 auto 40px auto;
    font-size: 20px;
    font-weigth: ${typography.font.weight.bold};

    &:before {
      content: '相關文章';
    }
  `}

  ${mq.mobileOnly`
    width: calc(309/355*100%);
  `}

  ${mq.tabletOnly`
    width: 513px;
  `}

  ${mq.desktopAndAbove`
    flex-shrink: 0;
    font-size: 16px;
    font-weigth: ${typography.font.weight.bold};
    line-height: 1.5;
    letter-spacing: 0.4px;
    margin-right: auto;
    padding-top: 5px;
    border-width: 0.5px 0 0 0;
    border-style: solid;
    position: relative;

    &::before {
      content: '相關文章';
      margin-left: 5px;
      margin-top: 5px;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 1px;
      height: 12px;
      border-width: 0 0.5px 0 0;
      border-style: solid;
    }
  `}

  ${mq.desktopOnly`
    width: 180px;
    margin-right: 15px;
  `}

  ${mq.hdOnly`
    width: 250px;
    margin-right: 12px;
  `}
`

const screen = {
  mobile: 768,
  destkop: 1024,
  hd: 1440,
}

export default class Related extends React.PureComponent {
  static propTypes = {
    data: PropTypes.array,
    hasMore: PropTypes.bool,
    id: PropTypes.string,
    loadMore: PropTypes.func.isRequired,
  }

  static defaultProps = {
    data: [],
    hasMore: false,
  }

  constructor(props) {
    super(props)

    this.state = {
      lastWindowWidth: 0,
    }

    this.handleWindowResize = _.debounce(this._handleWindowResize, 500).bind(
      this
    )
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleWindowResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize)
  }

  _handleWindowResize = () => {
    const curWindowWidth = window.innerWidth
    let lastWindowWidth

    // The following conditions are set for performance.
    // Since we only have three different device layout,
    // including mobile, desktop and hd,
    // we are not going to re-render `List` component
    // unless the resize events cause the layout change.
    if (curWindowWidth < screen.destkop) {
      lastWindowWidth = screen.mobile
    } else if (curWindowWidth < screen.hd) {
      lastWindowWidth = screen.destkop
    } else {
      lastWindowWidth = screen.hd
    }

    this.setState({
      lastWindowWidth,
    })
  }

  _buildRelated(related) {
    const style = _.get(related, 'style')
    const prefixPath = style === _articleStyles.interactive ? '/i/' : '/a/'
    const categories = related.categories
    // sort categories in ascending order
    _.sortBy(categories, ['sort_order'])

    // use og_image first
    const imageSet = _.get(related, 'og_image.resized_targets', {})
    // use `w400` image set first
    // if `w400` is not provided, then use `mobile` image set
    const thumbnail = _.get(imageSet, 'w400.url')
      ? imageSet.w400
      : imageSet.mobile

    return {
      category: _.get(categories, '0.name', ''),
      publishedDate: related.published_date,
      desc: related.og_description,
      href: prefixPath + related.slug,
      id: related.id,
      isTargetBlank: style === _articleStyles.interactive,
      // if `og_image` is not provided,
      // use `hero_image` as fallback
      thumbnail: _.get(thumbnail, 'url')
        ? thumbnail
        : _.get(related, 'hero_image.resized_targets.mobile'),
      title: related.title,
    }
  }

  render() {
    const { data, hasMore, id, loadMore } = this.props
    const { lastWindowWidth } = this.state
    const relateds = _.map(data, this._buildRelated)
    return (
      <Block>
        <Descriptor />
        <List
          key={`${id}-with-list-width-${lastWindowWidth}`}
          data={relateds}
          hasMore={hasMore}
          loadMore={loadMore}
        />
      </Block>
    )
  }
}
