// @flow

import { DOM as dom, Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import classnames from "classnames";
import actions from "../actions";
import { getSelectedSource, getSymbols } from "../selectors";
import { isEnabled } from "devtools-config";
import "./Outline.css";
import previewFunction from "./shared/previewFunction";

import type {
  SymbolDeclarations,
  SymbolDeclaration
} from "../utils/parser/getSymbols";
import type { SourceRecord } from "../reducers/sources";

class Outline extends Component {
  state: any;

  props: {
    isHidden: boolean,
    symbols: SymbolDeclarations,
    selectSource: (string, { line: number }) => any,
    selectedSource: ?SourceRecord
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  selectItem(location) {
    const { selectedSource, selectSource } = this.props;
    if (!selectedSource) {
      return;
    }
    const selectedSourceId = selectedSource.get("id");
    const startLine = location.start.line;
    selectSource(selectedSourceId, { line: startLine });
  }

  renderFunction(func: SymbolDeclaration) {
    const { name, location } = func;

    return dom.li(
      {
        key: `${name}:${location.start.line}`,
        className: "outline-list__element",
        onClick: () => this.selectItem(location)
      },
      previewFunction({ name })
    );
  }

  renderFunctions() {
    const { symbols } = this.props;

    return symbols.functions
      .filter(func => func.name != "anonymous")
      .map(func => this.renderFunction(func));
  }

  render() {
    const { isHidden } = this.props;
    if (!isEnabled("outline")) {
      return null;
    }

    return dom.div(
      { className: classnames("outline", { hidden: isHidden }) },
      dom.ul({ className: "outline-list" }, this.renderFunctions())
    );
  }
}

Outline.displayName = "Outline";

export default connect(
  state => {
    const selectedSource = getSelectedSource(state);
    return {
      symbols: getSymbols(state, selectedSource && selectedSource.toJS()),
      selectedSource
    };
  },
  dispatch => bindActionCreators(actions, dispatch)
)(Outline);
