import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import debounce from "debounce";
import { connect, ConnectedProps } from "react-redux";
import { Tag, Check } from "react-feather";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import ShotsDashboardContentHeaderControls from "components/DashboardContent/ShotsDashboardContentHeaderControls";
import ShotsDashboardContent from "components/DashboardContent/ShotsDashboardContent";
import EdpressoFeature from "components/Edpresso/EdpressoFeature";
import MaterialButton from "styles/elements/Button";
import Box from "@material-ui/core/Box";
import { SHOTS_READER_VIEW } from "constants/pageTitles";
import ActivityIndicator from "components/commonUI/ActivityIndicator";
import searchShotSummaries from "actions/featuredShotSummaries";
import * as NoResult from "blocks/NoResult";
import * as ShotTile from "blocks/WorkTile/ShotTile";
import shotTilesView from "constants/tilesView";
import ShotRequestComponent from "components/FeedbackComponent/ShotRequestComponent";
import * as Page from "blocks/Page";
import * as EdpressoDashboardStyled from "./styles";
import commonDashboardDecorator from "containers/DashboardPages/CommonDashboardDecorator";
import TagsPlaceholder from "containers/DashboardPages/tagsPlaceholder";
import TagsPlaceholderMobile from "containers/DashboardPages/tagsPlaceholderMobile";
import EdpressoNoResultImage from "containers/DashboardPages/images/edpressoNoResultImage.svg";
import { RootState } from "redux/modules/reducer";
import { Cookies, withCookies } from "react-cookie";
import update from "immutability-helper";
import Typography from "styles/atoms/Typography";

import { createSlice, createAction, PayloadAction } from "@reduxjs/toolkit";
import { Store, combineReducers } from "redux";
import store from "redux/create";
import { slice } from "redux/modules/loader";
import { stat } from "fs/promises";
import { EdpresooTileViewActions } from "redux/modules/EdpresooTileView";

type Props = ConnectedProps<typeof connector> &
  RouteComponentProps<{}> & {
    cookies?: Cookies;
    getShots;
    more;
    cursor;
    getTags;
    userInfo;
    loading;
  };

const connector = connect(
  (state: RootState) => ({
    searchString: state.search.searchString,
    shots: state?.reader?.shots?.data?.edpresso_shots || [],
    tagsData: state?.edpresso?.tags || null,
    contentLoading: state?.reader?.shots?.loading,
    currentTileView: state.EdpresooTileView.currentTileView,
  }),
  (dispatch) => ({ dispatch })
);

class EdpressoDashboardPage extends Component<Props, any> {
  state = {
    loading: false,
    searchData: null,
    stickyTags: false,
    allTagsMobile: false,
    tagsQuery: [],
    tags: [],
    currentTileView: null,
  };

  xhr = null;

  searchShots = debounce((searchString, searchTags, cursor = "") => {
    if (this.xhr) this.xhr.abort();
    if (!searchString && !searchTags) {
      this.setState({ searchData: null });
      return;
    }
    this.xhr = searchShotSummaries(
      cursor,
      searchString,
      searchTags,
      this.onSuccess,
      "published"
    );
  }, 200);

  componentDidMount() {
    window.addEventListener("scroll", this.loadScroll, true);
    // @ts-ignore
    const tagToSearch = this.props?.location?.tagToSearch;

    if (tagToSearch) {
      this.updateSelectedTags([tagToSearch]);
      return;
    }
    const sessionTags = sessionStorage.getItem("selectedEdpressoTags");
    if (sessionTags) {
      this.updateSelectedTags(sessionTags.split(","));
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.searchString !== nextProps.searchString) {
      const tagsString = this.state.tagsQuery.join(",");
      const { searchString } = nextProps;
      this.searchShots(searchString, tagsString, "");
      return false;
    }
    return true;
  }

  componentDidUpdate(prevProps) {
    const { shots } = this.props;
    if (prevProps.shots !== shots) this.setState({ loading: false });
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.loadScroll, true);
  }

  onSuccess = (data, cursor) => {
    const parsedData = JSON.parse(data);
    const searchData = cursor
      ? {
          ...parsedData,
          edpresso_shots: this.state.searchData.edpresso_shots.concat(
            parsedData.edpresso_shots
          ),
        }
      : parsedData;

    this.setState({
      searchData,
      loading: false,
    });
  };

  updateSelectedTags = (tags) => {
    this.setState(
      {
        tagsQuery: tags,
      },
      () => {
        const tagsString = this.state.tagsQuery.join(",");
        const { searchString } = this.props;
        this.saveSelectedTags(tagsString);
        this.searchShots(searchString, tagsString, "");
      }
    );
  };

  content;
  loadScroll = () => {
    const { loading } = this.state;
    const { bottom } = this.content.getBoundingClientRect();
    if (!loading && bottom <= window.innerHeight) this.loadMore();

    if (this.content.getBoundingClientRect().top < 102) {
      this.setState({ stickyTags: true });
    } else {
      this.setState({ stickyTags: false });
    }
  };

  loadMore = () => {
    const { more, cursor, shots, searchString, getShots } = this.props;
    const { searchData } = this.state;

    if (more && !searchData) {
      this.setState({ loading: true });
      getShots(cursor, shots, "published");
    } else if (searchData?.cursor) {
      this.setState({ loading: true });
      const tagsString = this.state.tagsQuery.join(",");
      this.searchShots(searchString, tagsString, searchData.cursor);
    }
  };

  loadMoreTags = () => {
    const { tagsData, getTags } = this.props;
    getTags(tagsData.data.cursor, tagsData.data.all_tags);
  };

  onSubmitSearch = () => {
    const tagsString = this.state.tagsQuery.join(",");
    const { searchString } = this.props;
    this.searchShots(searchString, tagsString, "");
  };

  onTileViewChange = (newTileView) => {
    const { currentTileView } = this.props;
    if (newTileView !== currentTileView) {
      store.dispatch(
        EdpresooTileViewActions.changeTileView({
          currentTileView: newTileView,
        })
      );
    }
  };

  saveSelectedTags = (tags) => {
    sessionStorage.setItem("selectedEdpressoTags", tags);
  };

  tagClicked = (tag) => {
    const selectedTags = [...this.state.tagsQuery];

    if (selectedTags.includes(tag)) {
      const tagsQuery = update(selectedTags, {
        $splice: [[selectedTags.indexOf(tag), 1]],
      });
      this.updateSelectedTags(tagsQuery);
    } else {
      const tagsQuery = update(selectedTags, {
        $push: [tag],
      });
      this.updateSelectedTags(tagsQuery);
    }
  };

  checkTagSelection = (tag) => this.state.tagsQuery.includes(tag);

  clearTagsQuery = () => {
    this.setState({
      tagsQuery: [],
    });
  };

  clearAllSelectedTags = () => {
    this.updateSelectedTags([]);
  };

  generateTags = (allTags) => {
    if (allTags) {
      const tags = allTags.map((tag) => {
        const tagName = Object.keys(tag)[0];
        return (
          <EdpressoDashboardStyled.Tag
            onClick={() => this.tagClicked(tagName)}
            selected={this.checkTagSelection(tagName)}
            key={tagName}
          >
            <Typography variant="navigationSmall" align="center">
              {tagName}
            </Typography>
          </EdpressoDashboardStyled.Tag>
        );
      });
      return tags;
    }
    return null;
  };

  genAllTags = (tagsJSX, tagsLoading, hasMoreTags) => {
    return (
      <EdpressoDashboardStyled.AllTags>
        {tagsJSX}
        <div style={{ width: "100%" }}>
          {tagsLoading && (
            <EdpressoDashboardStyled.TagsPlaceholder>
              <EdpressoDashboardStyled.DesktopPlaceholder>
                <TagsPlaceholder />
              </EdpressoDashboardStyled.DesktopPlaceholder>
              <EdpressoDashboardStyled.MobilePlaceholder>
                <TagsPlaceholderMobile />
              </EdpressoDashboardStyled.MobilePlaceholder>
            </EdpressoDashboardStyled.TagsPlaceholder>
          )}
          {!tagsLoading && hasMoreTags && (
            <MaterialButton
              variant="contained"
              color="primary"
              mx="auto"
              onClick={this.loadMoreTags}
            >
              SHOW MORE
            </MaterialButton>
          )}
        </div>
      </EdpressoDashboardStyled.AllTags>
    );
  };

  renderSelectedTags = (tags) => (
    <ShotTile.ShotTagsContainer>
      {tags.map((item) => (
        <ShotTile.Tag key={item} selected onClick={() => this.tagClicked(item)}>
          <Typography variant="eyebrow">{item}</Typography>
        </ShotTile.Tag>
      ))}
    </ShotTile.ShotTagsContainer>
  );

  toggleMobileTags = () => {
    this.setState({ allTagsMobile: !this.state.allTagsMobile });
  };

  setContentRef = (content) => {
    this.content = content;
  };

  render() {
    const {
      more,
      contentLoading,
      tagsData,
      dispatch,
      userInfo,
      location,
    } = this.props;
    const { searchData, loading, allTagsMobile, tagsQuery } = this.state;
    const { currentTileView } = this.props;
    const isLoggedIn = !!userInfo?.user_id;
    const shots = searchData ? searchData.edpresso_shots : this.props.shots;
    const scrollable = searchData ? searchData.cursor : more;
    const allTags = tagsData.data ? tagsData.data.all_tags : null;
    const tagsLoading = tagsData.loading ? tagsData.loading : false;
    const hasMoreTags = tagsData.data ? tagsData.data.more : null;
    const tagsJSX = this.generateTags(allTags);
    const allTagsJSX = this.genAllTags(tagsJSX, tagsLoading, hasMoreTags);

    const tagsSelectedRaw = tagsQuery;
    const selectedTags =
      tagsSelectedRaw.length > 0
        ? this.renderSelectedTags(tagsSelectedRaw)
        : {};
    const selectedTagsJSX = (
      <EdpressoDashboardStyled.SelectedTagsContainer>
        {tagsSelectedRaw.length > 0 && [
          <TransitionGroup key="selected-tags-list">
            <CSSTransition clsasNames="tags_selected_show" timeout={300}>
              <EdpressoDashboardStyled.SelectedTagsContainer
                style={{ minHeight: 65 }}
              >
                <EdpressoDashboardStyled.SelectedTags>
                  {selectedTags}
                </EdpressoDashboardStyled.SelectedTags>
                <Box mt={1}>
                  <MaterialButton
                    size="small"
                    onClick={this.clearAllSelectedTags}
                  >
                    Clear all
                  </MaterialButton>
                </Box>
              </EdpressoDashboardStyled.SelectedTagsContainer>
            </CSSTransition>
          </TransitionGroup>,
        ]}
      </EdpressoDashboardStyled.SelectedTagsContainer>
    );

    return (
      <Page.default>
        <Helmet
          title={SHOTS_READER_VIEW}
          meta={[{ property: "og:title", content: SHOTS_READER_VIEW }]}
        />
        <EdpressoDashboardStyled.CircleButton onClick={this.toggleMobileTags}>
          {tagsSelectedRaw.length > 0 && (
            <EdpressoDashboardStyled.TagsCount>
              <Typography variant="content">
                {tagsSelectedRaw.length}
              </Typography>
            </EdpressoDashboardStyled.TagsCount>
          )}
          {allTagsMobile ? <Check size={20} /> : <Tag size={20} />}
        </EdpressoDashboardStyled.CircleButton>
        {allTagsMobile && (
          <EdpressoDashboardStyled.MobileTagsContainer>
            <Typography variant="h5">
              <span className="heading">Popular Tags</span>
            </Typography>
            {selectedTagsJSX}
            {allTagsJSX}
          </EdpressoDashboardStyled.MobileTagsContainer>
        )}
        <EdpressoFeature />
        <ShotsDashboardContentHeaderControls
          mode="reader"
          submitSearch={this.onSubmitSearch}
          tileView={currentTileView}
          onTileViewChange={this.onTileViewChange}
        />
        <EdpressoDashboardStyled.default>
          <EdpressoDashboardStyled.TilesContainer ref={this.setContentRef}>
            <ShotsDashboardContent
              isViewer
              inDashboard
              shots={shots}
              loading={contentLoading}
              dispatch={dispatch}
              isLoggedIn={isLoggedIn}
              location={location}
              tileView={currentTileView}
            />
            {!scrollable && !this.props.loading && (
              <NoResult.default isEdpresso>
                <img
                  src={EdpressoNoResultImage}
                  loading="lazy"
                  alt="edpresso no results"
                  className="NoResult"
                  width="278.75px"
                  height="192px"
                />
                <NoResult.Text isEdpresso>
                  <Typography variant="bodyMedium">
                    Can&apos;t find what you are looking for?{" "}
                    <strong>Suggest a shot</strong>
                  </Typography>
                </NoResult.Text>
                <ShotRequestComponent />
              </NoResult.default>
            )}
            {loading && <ActivityIndicator isShot enlarge />}
          </EdpressoDashboardStyled.TilesContainer>
          <EdpressoDashboardStyled.TagsContainer>
            <EdpressoDashboardStyled.ContainerStatic
              isSticky={this.state.stickyTags}
            >
              <EdpressoDashboardStyled.TagsHeading>
                <EdpressoDashboardStyled.Seperator />
                <Typography variant="bodyMedium">
                  <span style={{ margin: "0px 10px" }}>Popular Tags</span>
                </Typography>
                <EdpressoDashboardStyled.Seperator />
              </EdpressoDashboardStyled.TagsHeading>
              {selectedTagsJSX}
              {allTagsJSX}
            </EdpressoDashboardStyled.ContainerStatic>
          </EdpressoDashboardStyled.TagsContainer>
        </EdpressoDashboardStyled.default>
      </Page.default>
    );
  }
}

export default commonDashboardDecorator(
  false,
  true
)(connector(withRouter(withCookies(EdpressoDashboardPage))));
