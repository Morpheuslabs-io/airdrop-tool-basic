import React, {Component} from 'react';
import {Row, Col, Button, ButtonGroup} from 'reactstrap';
import InputField from '../../util/InputField';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';
import Papa from 'papaparse';
import Button2 from '@material-ui/core/Button';
import swal from "sweetalert2";
import {isValidAddress, getNetworkName} from '../../util/blockchainHelper';
import Spinner from 'react-spinkit';

import AirdropModal from './AirdropModal'

class AirdropList extends Component {

  state = {
    address: '',
    amount: 0,
    
    erc20Address: '',
    errorErc20Address: '',

    errorAddress: '',
    errorAmount: '',
    errorWMax: '',
    
    airdroplist: [],
    spinnerShow: false,

    showModal: false,
    resourceHandleErr: false,
    isProcessing: false,
  };

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    })
  };

  handleBlurAddress = () => {
    const address = this.state.address;
    let errorAddress = '';
    if (address === '' || !isValidAddress(address))
      errorAddress = 'The inserted address is invalid';
    else
      errorAddress = '';
    this.setState({
      errorAddress,
    });
  };

  handleBlurERC20Address = () => {
    const address = this.state.erc20Address;
    let errorAddress = '';
    if (address === '' || !isValidAddress(address))
      errorAddress = 'The inserted address is invalid';
    else
      errorAddress = '';
    this.setState({
      errorErc20Address: errorAddress,
    });
  };

  handleBlurAmount = () => {
    const amount = parseFloat(this.state.amount);

    this.setState({
      errorAmount: amount <= 0 ? 'Please enter a valid number greater than 0' : ''
    });
  };

  handleAddNew = () => {
    const address = this.state.address;
    const amount = parseFloat(this.state.amount);
    let errorAddress = '';
    let errorAmount = '';

    let hasError = false;
    if (address === '' || !isValidAddress(address)) {
      errorAddress = 'The inserted address is invalid';
      hasError = true;
    } else
      errorAddress = '';

    if (amount <= 0) {
      errorAmount = 'Please enter a valid number greater than 0';
      hasError = true;
    } else
      errorAmount = '';

    this.setState({
      errorAddress,
      errorAmount
    });

    if (!hasError) {
      this.setState({
        airdroplist: [...this.state.airdroplist, {address, amount}]
      })
    }
  };

  handleUploadCSV = event => {
    const file = event.target.files[0];
    if (file) {
      let fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        this.setState({
          airdroplist: []
        })
        let csv = Papa.parse(fileReader.result);
        let airdroplist = [];
        for (const idx in csv.data) {
          let addr = csv.data[idx][0]
          let amount = parseFloat(csv.data[idx][1])
          if (isValidAddress(addr) && amount > 0) {
            airdroplist.push({address: addr, amount: amount});
          }
        }
        this.setState({
          airdroplist
        });
      };
      fileReader.readAsText(file);
      event.target.value = null;
    }
  };

  airdropWithMetamask = () => {
    // console.log('airdropWithMetamask - this.state.erc20Address:', this.state.erc20Address)
    // console.log('airdropWithMetamask - this.state.airdroplist:', this.state.airdroplist)
    let metamaskNet = getNetworkName()
    let chosenNet = this.props.radioSelected
    if (metamaskNet !== chosenNet) {
      swal(`Your currently-chosen net (${chosenNet}) is different from current Metamask net (${metamaskNet})`, "", "warning");
      return
    }
    this.handleToggleModal()
  }

  handleToggleModal = () => {
    const { showModal } = this.state
    this.setState({
      showModal: !showModal,
      resourceHandleErr: false,
      isProcessing: false
    })
  }

  setResourceHandleErr = (val) => {
    this.setState({
      resourceHandleErr: val
    })
  }

  setIsProcessing = (val) => {
    this.setState({
      isProcessing: val
    })
  }
  
  render() {
    return (
      <div>
        <AirdropModal 
          showModal={this.state.showModal}
          handleToggleModal={this.handleToggleModal}
          setResourceHandleErr={this.setResourceHandleErr}
          resourceHandleErr={this.state.resourceHandleErr}
          setIsProcessing={this.setIsProcessing}
          isProcessing={this.state.isProcessing}

          erc20Address={this.state.erc20Address}
          airdroplist={this.state.airdroplist}

          radioSelected={this.props.radioSelected}
        />
        <div className='container step-widget widget-1'>
          <div className='widget-header'>
            <div>
              <p className='title'>Airdrop Tool</p>
              <p className='description'>Please enter information</p>
            </div>
          </div>
          {
            this.state.spinnerShow ?
              <div>
                <Spinner 
                  className='justify-content-center align-items-center mx-auto' 
                  name='three-bounce' color='#00B1EF' style={{ width: 100, margin: 250 }}
                  noFadeIn
                />
              </div>
              :
              <div className='wg-content'>
                <div>
                  <Row>
                    <Col md={5}>
                      <InputField id='erc20Address' nameLabel='ERC20 Token Address' type='text' onChange={this.handleChange} value={this.state.erc20Address}
                                  onBlur={this.handleBlurERC20Address} hasError={this.state.errorErc20Address}/>
                    </Col>
                  </Row>
                </div>
                <br></br>
                <div>
                  <p className='wg-label fs-22px'>Recipient List</p>
                  <Row>
                    <Col md={5}>
                      <InputField id='address' nameLabel='Address' type='text' onChange={this.handleChange} value={this.state.address}
                                  onBlur={this.handleBlurAddress} hasError={this.state.errorAddress}/>
                    </Col>
                    <Col md={3}>
                      <InputField id='amount' nameLabel='Amount' type='number' onChange={this.handleChange} value={this.state.amount}
                                  onBlur={this.handleBlurAmount} hasError={this.state.errorAmount}/>
                    </Col>
                    <Col md={1}>
                      <IconButton component='span' className='add-whitelist' onClick={this.handleAddNew}><i className='fas fa-plus'/></IconButton>
                    </Col>
                  </Row>
                </div>
                <Row>
                  <Col>
                    <input id='upload-csv' className='upload-csv' multiple type='file' accept=".csv" onChange={this.handleUploadCSV}/>
                    <label htmlFor='upload-csv'>
                      <Button2 variant="contained" component='span' className='upload-btn'>
                        <i className='fas fa-upload'/>
                        &nbsp; Upload CSV
                      </Button2>
                    </label>
                  </Col>
                  <Col>
                    <a href='/airdrop_sample.csv'>Download Sample CSV</a>
                  </Col>
                </Row>
                <br></br>
                {
                  this.state.airdroplist.length !== 0 &&
                  <div>
                    <table className='table table-striped table-bordered'>
                      <thead>
                      <tr>
                        <th>Address</th>
                        <th>Amount</th>
                      </tr>
                      </thead>
                      <tbody>
                      {
                        this.state.airdroplist.map((val, key) => (
                          <tr key={key}>
                            <td>{val.address}</td>
                            <td>{val.amount}</td>
                          </tr>
                        ))
                      }
                      </tbody>
                    </table>
                    <Row>
                      <Col className='float-left'>
                        <Button
                          onClick={this.airdropWithMetamask}
                          variant='contained' size='large' color="primary"
                        >
                            Airdrop with Metamask
                        </Button>
                      </Col>
                      { this.state.doneShow &&
                          <Col className='float-right' md={4}>
                            <Button
                              onClick={this.onDone}
                              variant='contained' size='large' color="primary"
                            >
                                Done
                            </Button>
                          </Col>
                      }
                    </Row>
                  </div>
                }
              </div>
          }
        </div>
      </div>
    );
  }
}

AirdropList.propTypes = {
  id: PropTypes.number.isRequired,
};

export default AirdropList;