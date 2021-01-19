import PropTypes from 'prop-types'
import React from 'react'
import url from 'url'

// TODO(taylrj): update to the topic landing page link
const podcastTopicLandingPageLink = 'https://www.twreporter.org/a/podcast-list'

class PodcastLandingPageLinkWithUtm extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    utmMedium: PropTypes.string,
    utmSource: PropTypes.string,
    utmCampaign: PropTypes.string,
  }

  state = {
    isClient: false,
  }

  componentDidMount() {
    this.setState({
      isClient: true,
    })
  }

  setSearchParams(originalUrl) {
    const { utmSource, utmMedium, utmCampaign } = this.props
    try {
      const params = {
        utm_source: utmSource || window.location.host,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      }
      const urlObj = new URL(originalUrl)
      for (let key in params) {
        if (params[key]) {
          urlObj.searchParams.set(key, params[key])
        }
      }
      return url.format(urlObj)
    } catch (e) {
      console.warn('Can not get podcast landing page url with utm param', e)
    }
  }

  render() {
    const { children } = this.props
    const { isClient } = this.state
    let podcastLandingPageURL = podcastTopicLandingPageLink

    if (isClient) {
      // client side rendering
      podcastLandingPageURL = this.setSearchParams(podcastTopicLandingPageLink)
    }

    return (
      <a href={podcastLandingPageURL} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
}

export default PodcastLandingPageLinkWithUtm
