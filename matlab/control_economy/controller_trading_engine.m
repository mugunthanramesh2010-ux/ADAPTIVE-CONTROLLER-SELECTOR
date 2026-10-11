function trade = controller_trading_engine(buyerPlant, sellerController, bidPrice)
% CONTROLLER_TRADING_ENGINE Executes decentralized IP and gain asset transfers
    trade.Status = 'EXECUTED';
    trade.Asset = sellerController;
    trade.Settlement = bidPrice;
    disp(['Controller Asset Transferred to: ', buyerPlant]);
end
