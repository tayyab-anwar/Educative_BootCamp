import { useEffect } from "react";
import { useState } from "react";
import { connect, ConnectedProps } from "react-redux";

import { modalActions } from "redux/modules/modals";
import { getUserTransactions } from "actions/transactions";
import PageStatusControl from "components/commonUI/PageStatusControl";
import TransactionsComponent from "components/TransactionsComponent";
import * as Page from "blocks/Page";
import Footer from "components/Footer";
import { RootState } from "redux/modules/reducer";
import { TRANSACTION_TYPES } from "constants/index";
import update from "immutability-helper";

function mapStateToProps({ user: { info } }: RootState) {
  return {
    userInfo: info,
  };
}

type Props = ConnectedProps<typeof connector> & {};

const connector = connect(mapStateToProps, {
  showModal: modalActions.show,
  updateModal: modalActions.update,
});
const defaultProps = {
  userInfo: null,
  showModal: null,
  updateModal: null,
};
function Transaction(props, any) {
  const [purchasesData, setPurchasesData] = useState(null);
  const [tracksPurchasesData, setTracksPurchasesData] = useState(null);
  const [groupPurchasesData, setGroupPurchasesData] = useState(null);
  const [subscriptionPurchasesData, setSubscriptionPurchasesData] = useState(
    null
  );
  const [
    teamSubscriptionPurchasesData,
    setTeamSubscriptionPurchasesData,
  ] = useState(null);

  useEffect(() => {
    getUserTransactions()
      .then((res) => {
        const result = JSON.parse(res);
        setPurchasesData(result.transactions);
        setTracksPurchasesData(result.track_transactions);
        setSubscriptionPurchasesData(result.subscription_transactions);
        setGroupPurchasesData(result.groupPurchasesData);
        setTeamSubscriptionPurchasesData(result.team_subscription_transactions);
      })
      .catch(() => {
        setPurchasesData(null);
        setTracksPurchasesData(null);
        setGroupPurchasesData(null);
      });
  });

  const updatePurchase = (type, purchase) => {
    const stateMap = {
      [TRANSACTION_TYPES.SALE]: "purchasesData",
      [TRANSACTION_TYPES.GROUP]: "groupPurchasesData",
      [TRANSACTION_TYPES.TRACK]: "tracksPurchasesData",
      [TRANSACTION_TYPES.SUBSCRIPTION]: "subscriptionPurchasesData",
      [TRANSACTION_TYPES.TEAM_SUBSCRIPTION]: "teamSubscriptionPurchasesData",
    };

    if (stateMap[type]) {
      const index = [stateMap[type]].findIndex(
        (el) => el.order_id === purchase.order_id
      );
      if (index >= 0) {
        let data = null;
        switch (stateMap[type]) {
          case "purchasesData":
            data = update(purchasesData, {
              [index]: { $set: purchase },
            });
            setPurchasesData(data);
            break;
          case "groupPurchasesData":
            data = update(groupPurchasesData, {
              [index]: { $set: purchase },
            });
            setGroupPurchasesData(data);
            break;
          case "tracksPurchasesData":
            data = update(tracksPurchasesData, {
              [index]: { $set: purchase },
            });
            setTracksPurchasesData(data);
            break;
          case "subscriptionPurchasesData":
            data = update(subscriptionPurchasesData, {
              [index]: { $set: purchase },
            });
            setSubscriptionPurchasesData(data);
            break;
          case "teamSubscriptionPurchasesData":
            data = update(teamSubscriptionPurchasesData, {
              [index]: { $set: purchase },
            });
            setTeamSubscriptionPurchasesData(data);
            break;
          default:
            break;
        }
      }
    }
  };

  const { userInfo, showModal, updateModal } = props;
  const loggedIn = !!userInfo?.data?.user_id;
  return (
    <Page.default>
      <PageStatusControl loading={!loggedIn} />
      <Page.PageContent>
        <TransactionsComponent
          purchasesData={purchasesData}
          tracksPurchasesData={tracksPurchasesData}
          subscriptionPurchasesData={subscriptionPurchasesData}
          groupPurchasesData={groupPurchasesData}
          teamSubscriptionPurchasesData={teamSubscriptionPurchasesData}
          showModal={showModal}
          updateModal={updateModal}
          updatePurchase={updatePurchase}
        />
      </Page.PageContent>
      <Footer />
    </Page.default>
  );
}

export default connector(Transactions);
