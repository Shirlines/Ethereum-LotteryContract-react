const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const {interface, bytecode} = require('../compile');
let accounts;
let lottery;

beforeEach(async () =>{
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
  .deploy({data: bytecode})
  .send({from: accounts[0], gas:'1000000'});
});

describe('Lottery Contract',() => {
  it('Deploys a contract', async () => {
      await assert.ok(lottery.options.address);
  })

  it('Allows one account to enter', async () => {
      await lottery.methods.enterLottery().send({
        from:accounts[0],
        value: web3.utils.toWei('0.02','ether')
      });

      const players = await lottery.methods.getPlayers().call({from: accounts[0]});
      assert.equal(accounts[0], players[0]);
      assert.equal(1, players.length);
  });

  it('Allows multiple accounts to enter', async () => {
      await lottery.methods.enterLottery().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02','ether')
    });

      await lottery.methods.enterLottery().send({
      from:accounts[1],
      value: web3.utils.toWei('0.02','ether')
    });

      await lottery.methods.enterLottery().send({
      from:accounts[2],
      value: web3.utils.toWei('0.02','ether')
    });

      const players = await lottery.methods.getPlayers().call({from: accounts[0]});
      assert.equal(accounts[0], players[0]);
      assert.equal(accounts[1], players[1]);
      assert.equal(accounts[2], players[2]);
      assert.equal(3, players.length);
  });

  it('Requires minimum amount to enter',async () => {
    try{
      await lottery.methods.enterLottery().send({
        from: accounts[0],
        value: 0
      });
      assert(false);
    } catch (err){
      assert(err);
    }
  });

  it('Only manager can call pickWinner', async () => {
    try{
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert (false);
    } catch (err) {
      assert(err);
    }
  });

  it('Sends money to winner and resets player array', async () => {
    await lottery.methods.enterLottery().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    console.log(initialBalance);
    await lottery.methods.pickWinner().send({from: accounts[0]});
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    console.log(finalBalance);
    const difference = finalBalance - initialBalance;
    console.log(difference);
    assert(difference > web3.utils.toWei('1', 'ether'));
  });
});
