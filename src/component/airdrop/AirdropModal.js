import React, { Component } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  Collapse,
  Alert,
  Row, Col
} from 'reactstrap'
import Spinner from 'react-spinkit'
import {
  getERC20TokenDetails,
  isValidAddress,
  getMetamaskAddress,
  doAirdrop
} from "../../util/blockchainHelper"
import Web3 from "web3";
import swal from "sweetalert2";
import {getNormalGasPrice} from "../../util/Util";

const BATCH_SIZE_MAX = process.env.REACT_APP_BATCH_SIZE_MAX;

const airdropContractAddressRinkeby = process.env.REACT_APP_AIRDROP_CONTRACT_RINKEBY
const airdropContractAddressMainnet = process.env.REACT_APP_AIRDROP_CONTRACT_MAINNET

const GASLIMIT = process.env.REACT_APP_GASLIMIT

class AirdropModalContainer extends Component {
  constructor (props) {
    super(props)
    
    this.state = {
      tokenInfo: {},
      web3: new Web3(window.web3.currentProvider),
      erc20ContractInst: null,

      airdropAddressBatch: [],
      airdropAmountBatch: [],
      airdropTokenAmount: 0,
      airdropReceiverAmount: 0,
      userAccount: '',
      gasPrice: 0,

      radioSelected: '',
      airdropContractAddress: ''
    }
  }

  handleAirdropWithMetaMask = () => {
    let {tokenInfo, airdropTokenAmount, airdropAddressBatch, airdropAmountBatch} = this.state

    console.log('airdropAddressBatch:', airdropAddressBatch);
    console.log('airdropAmountBatch:', airdropAmountBatch);
    
    // Check if user has enough tokens for airdrop
    if (parseFloat(airdropTokenAmount) > parseFloat(tokenInfo.userBalance)) {
      swal('Error', 'Not enough tokens for doing airdrop')
    }

    this.props.setIsProcessing(true)
    this.props.setResourceHandleErr(false)

    this.approveAndDoAirdrop()
  }

  getAllowance = () => {
    let {tokenInfo, erc20ContractInst, userAccount, airdropContractAddress} = this.state
    let instance = erc20ContractInst.at(tokenInfo.address)

    return new Promise((resolve, reject) => instance.allowance(userAccount, airdropContractAddress, (err, res) => {
      if (err) return reject(err);
      else return resolve(Number(res));
    }));
  };

  doAirdropSimple = (erc20Address, airdropContractAddress, airdropAddressBatch, airdropAmountBatch) => {
    
    doAirdrop(erc20Address, airdropContractAddress, airdropAddressBatch[0], airdropAmountBatch[0])
      .then(res => {
        this.props.setIsProcessing(false)
        this.props.setResourceHandleErr('Success')
      })
  }

  approveAndDoAirdrop = () => {
    let {tokenInfo, airdropTokenAmount, erc20ContractInst, userAccount, gasPrice, airdropAddressBatch, airdropAmountBatch, airdropContractAddress} = this.state
    let instance = erc20ContractInst.at(tokenInfo.address)
    
    // const GAS = process.env.REACT_APP_GAS;
    // const GASPRICE = process.env.REACT_APP_GAS_PRICE;

    const gasOpt = {
      gas: GASLIMIT,
      gasPrice: gasPrice,
      from: userAccount
    };

    airdropTokenAmount *= 10**tokenInfo.decimals

    this.getAllowance()
      .then(allowance => {
        if (allowance === 0) {
          console.log('approveAndDoAirdrop - No allowance yet');

          return new Promise((resolve, reject) => instance.approve(airdropContractAddress, airdropTokenAmount, gasOpt, (err, res) => {
            if (err) return reject(err);
            else {
              console.log('approveAndDoAirdrop for allowance:', res);
              
              setTimeout(() => {
                this.doAirdropSimple(tokenInfo.address, airdropContractAddress, airdropAddressBatch, airdropAmountBatch)
              }, 30*1000);

              return resolve(res);
            }
          }));

        } else {
          console.log('approveAndDoAirdrop - Has already allowance:', allowance);

          // First, must approve 0
          return new Promise((resolve, reject) => instance.approve(airdropContractAddress, 0, gasOpt, (err, res) => {
            if (err) return reject(err);
            else {
              console.log('approveAndDoAirdrop for 0 allowance:', res);
              return new Promise((resolve, reject) => instance.approve(airdropContractAddress, airdropTokenAmount, gasOpt, (err, res) => {
                if (err) return reject(err);
                else {
                  console.log('approveAndDoAirdrop for allowance:', res);
                  
                  setTimeout(async () => {
                    this.doAirdropSimple(tokenInfo.address, airdropContractAddress, airdropAddressBatch, airdropAmountBatch)
                  }, 30*1000);

                  return resolve(res);
                }
              }));
            }}
          ));
        }
      });
  }

  getERC20TokenDetails = (erc20Address, userAccount) => {

    // console.log(`getERC20TokenDetails - erc20Address:${erc20Address}, userAccount:${userAccount}`);
      
    let instance = this.state.erc20ContractInst.at(erc20Address)
    const name = new Promise((resolve, reject) => instance.name((err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    }));

    const symbol = new Promise((resolve, reject) => instance.symbol((err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    }));
    const decimals = new Promise((resolve, reject) => instance.decimals((err, res) => {
      if (err) return reject(err);
      else return resolve(res);
    }));

    const userBalance = new Promise((resolve, reject) => instance.balanceOf(userAccount, (err, res) => {
      if (err) return reject(err);
      else return resolve((res));
    }));

    return Promise.all([name, symbol, decimals, userBalance]).then(data => {
      return {
        name: data[0],
        symbol: data[1],
        decimals: Number(data[2]),
        userBalance: Number(data[3]) / 10**Number(data[2]),
      };
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.erc20Address !== nextProps.erc20Address) {
      let userAccount = getMetamaskAddress()
      this.setState({
        userAccount
      })
      let erc20Address = nextProps.erc20Address
      // console.log('erc20Address:', erc20Address);
      if (erc20Address && isValidAddress(erc20Address)) {
        this.getERC20TokenDetails(erc20Address, userAccount)
          .then(tokenInfo => {
            tokenInfo.address = erc20Address
            // console.log('token:', tokenInfo);
            this.setState({
              tokenInfo
            })
          })

        getNormalGasPrice().then(gasPrice => {
          console.log('gasPrice:', gasPrice);
          this.setState({
            gasPrice
          })
        })
      }
    }

    if (this.props.airdroplist !== nextProps.airdroplist) {
      let airdroplist = nextProps.airdroplist
      // console.log('airdroplist:', airdroplist);
      let airdropTokenAmount = 0
      
      let airdropAddressBatch = []
      let airdropAddressBatchEntry = []

      let airdropAmountBatch = []
      let airdropAmountBatchEntry = []

      for (let i=0; i<airdroplist.length; i++) {
        let airdropListEntry = airdroplist[i]
        // console.log('airdropListEntry:', airdropListEntry);
        airdropTokenAmount += parseFloat(airdropListEntry.amount)

        if (airdropAddressBatchEntry.length >= BATCH_SIZE_MAX) {
          airdropAddressBatch.push(airdropAddressBatchEntry)
          airdropAmountBatch.push(airdropAmountBatchEntry)

          airdropAddressBatchEntry = []
          airdropAmountBatchEntry = []
        }

        airdropAddressBatchEntry.push(airdropListEntry.address)
        airdropAmountBatchEntry.push(airdropListEntry.amount * (10**this.state.tokenInfo.decimals))
      }

      airdropAddressBatch.push(airdropAddressBatchEntry)
      airdropAmountBatch.push(airdropAmountBatchEntry)

      this.setState({
        airdropAddressBatch,
        airdropAmountBatch,
        airdropTokenAmount,
        airdropReceiverAmount: airdroplist.length
      })
    }

    if (this.props.radioSelected !== nextProps.radioSelected) {
      let radioSelected = nextProps.radioSelected
      if (this.state.radioSelected !== radioSelected) {
        console.log('Newly-updated net:', radioSelected);
        this.setState({
          radioSelected,
          airdropContractAddress: radioSelected === 'rinkeby' ? airdropContractAddressRinkeby : airdropContractAddressMainnet
        })
      }
    }
  }

  async componentDidMount() {
    let {web3} = this.state
    let erc20ABI = await (await fetch("./erc20.abi.json")).json();
    // console.log("arc20ABI: ",erc20ABI);
    let erc20ContractInst = web3.eth.contract(erc20ABI)
    // let userAccount = getMetamaskAddress()

    // let net = this.props.net.type
    // console.log('Current net:', net);
    let net=''

    this.setState({
      erc20ContractInst,
      // userAccount,
      net,
      // airdropContractAddress: net === 'rinkeby' ? airdropContractAddressRinkeby : airdropContractAddressMainnet
      airdropContractAddress: airdropContractAddressRinkeby
    })
  }

  render () {
    const { value, tokenInfo, airdropAddressBatch, airdropTokenAmount, airdropReceiverAmount, userAccount } = this.state
    const { showModal, isProcessing, handleToggleModal, erc20Address, airdroplist, resourceHandleErr } = this.props
    const userBalance=0
    return (
      <div>
        <Modal
          isOpen={showModal}
          className={this.props.className}
          size='lg'
        >
          <ModalHeader toggle={handleToggleModal}>
            <div>Please confirm the following Airdrop </div>
          </ModalHeader>
          <ModalBody>
            <div>
              <Collapse isOpen={resourceHandleErr !== false} size='sm'>
                {resourceHandleErr === 'Success' ? (
                  <Alert color='success'>
                    <div>
                      <div>
                        <b>Airdrop done! Please check transactions on EtherScan via your Metamask</b>
                      </div>
                    </div>
                  </Alert>
                ) : (
                  <Alert color='danger'>{resourceHandleErr}</Alert>
                )}
              </Collapse>
            </div>
            <div>
              <ul>
                <li>
                  <b> Token info </b>
                    <ul>
                      <li>
                        Address: {erc20Address}
                      </li>
                      <li>
                        Name: {tokenInfo.name}
                      </li>
                      <li>
                        Symbol: {tokenInfo.symbol}
                      </li>
                      <li>
                        Decimals: {tokenInfo.decimals}
                      </li>
                    </ul>
                </li>
                <li>
                  <b> Airdrop token amount: </b> {new Intl.NumberFormat().format(airdropTokenAmount)}
                </li>
                <li>
                  <b> Airdrop receiver amount: </b> {new Intl.NumberFormat().format(airdropReceiverAmount)}
                </li>
                <li>
                  <b> Your current token balance: </b> {new Intl.NumberFormat().format(tokenInfo.userBalance)}
                </li>
                <li>
                  <b> Your current account address: </b> {userAccount}
                </li>
              </ul>
            </div>
            <div>
              <Row>
                <Col className='float-left'>
                  <Button
                    color='primary'
                    onClick={() => {this.handleAirdropWithMetaMask()}}
                  >
                    {isProcessing ?
                      <Spinner
                        name='three-bounce'
                        color='white'
                        fadeIn='none'
                      />
                      : 
                      <span>Submit</span>
                    }
                  </Button>
                </Col>
                <Col className='float-right'>
                  <Button
                    color='secondary'
                    onClick={handleToggleModal}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
}

export default AirdropModalContainer;