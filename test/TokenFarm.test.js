const { assert } = require('chai');

const DaiToken = artifacts.require('DaiToken');
const DappToken = artifacts.require('DappToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n.toString(), 'ether');
}

contract( 'TokenFarm', ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm

    before(async() => {
        //load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //transfer to Tokenfarm
        await dappToken.transfer(tokenFarm.address , tokens(1000000))

        await daiToken.transfer(investor, tokens(100), {from : owner})
    })

    describe('Mock Dai Deployment', async() => {
        it('has a name', async () => { 
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token Deployment', async() => {
        it('has a name', async () => { 
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm Deployment', async() => {
        it('has a name', async () => { 
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens(1000000))
        })
    })

    describe('farming tokens', async() => {
        it('rewards stakers with tokens', async () => {
            let result
            //check balance for staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(100), 'investor balance correct before staking')

            //stake mDai
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor})
            await tokenFarm.stakeTokens(tokens(100), { from: investor })

            // check result
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(0), 'investor balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens(100), 'farm balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result, true, 'investor staking status correct')

            //Issue Tokens
            await tokenFarm.issueTokens({ from : owner })

            //check balance after issuing
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(100), 'investor balance is correct')

            await tokenFarm.issueTokens({ from: investor}).should.be.rejected;

            await tokenFarm.unstakeTokens({ from : investor})
            
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens(100), 'investor balance is correct')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens(0), 'farm balance is correct')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens(0), 'now tokens in farm')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result, false, 'investor is no longer staking')


        })
    })
})