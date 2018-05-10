const HDWalletProvider = require ('truffle-hdwallet-provider');
const Web3 = require ('web3');
const { interface, bytecode } = require ('./compile');

const provider = new HDWalletProvider('hedgehog sister payment move power alpha dinosaur box tell entire plunge comfort',
'https://rinkeby.infura.io/BIYiXBKnVWqnyH3t0gTY ');

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Deploying from account:', accounts[0]);
    const lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: '0x' + bytecode})
        .send({from: accounts[0], gas: '1000000'})

    console.log(interface);
    console.log('Contracrt deployed to', lottery.options.address);
  };

deploy();
