let Popup = {
	template:'<div class="layer-msg fadeInUp" v-if="content"><span class="text">{{content}}</span></div>',
	data () {
	    return {
	      	content: '',
	      	time:6,
	      	timer:""
	    }
	},
	mounted(){
		this.timer = setTimeout(()=>{
			this.content = "";
		},this.time*1000)
	},
	beforeDestroy () {
		if (this.timer) {
            clearTimeout(this.timer)
        }
    }
}

const PopupBox = Vue.extend(Popup)

Vue.prototype.$popup = function (data) {
  	let instance = new PopupBox({data}).$mount()
  	document.getElementById("app").appendChild(instance.$el)
}

let InviteCodeObj = {
	template:`<div class="invite-code-wrapper" v-if="showCodeFlag">
	    <div class="mask" @click.stop="close"></div>
	    <div class="dialog-wrapper fadeInUp">
            <div class="flex center">{{myCode}}</div>
            <div><input type="text" class="invite-code-input" v-model="code"></div>
            <div><button class="auth-btn copy-btn" data-clipboard-action="copy" :data-clipboard-text="dataCode">Copy link</button></div>
        </div>
	</div>`,
	data () {
	    return {
	    	showCodeFlag:true,
	    	myCode:"My code",
	    	copy:"Code",
	    	copysuccess:"Copy Success",
	    	copyfail:"Copy Fail",
	      	code:"",
	      	dataCode:""
	    }
	},
	mounted(){
		if(location.hash.indexOf("code")<0){
			if(location.href.indexOf("/Qm")>-1){
				this.dataCode = location.origin+"/"+location.href.slice(http1.indexOf("/Qm")+1).split("/")[0]+"/#/home?code="+this.code;
			}else{
				this.dataCode = "https://dbcen.github.io/dawnbreak/#/home?code=" + this.code;
			}
		}else{
			this.dataCode = location.href;
		}
		setTimeout(()=>{
            var clipboard = new ClipboardJS('.copy-btn');
            clipboard.on('success', (e)=> {
                this.showCodeFlag = false;
                this.$popup({content: this.copysuccess})
            });
            clipboard.on('error', (e)=> {
                this.$popup({content: this.copyfail})
            });
        },1000)
	},
	methods:{
		close(){
			this.showCodeFlag = false;
		}
		
	},
	beforeDestroy () {}
}

const InviteCode = Vue.extend(InviteCodeObj)

Vue.prototype.$showCode = function (data) {
  	let instance = new InviteCode({data}).$mount()
  	document.getElementById("app").appendChild(instance.$el)
}


window.Title = {
	template:`<div><div class="flex page-title"><span class="icon-menu"  @click="showMenu"></span><span class="grow flex product-name"><img src="logo-text.png" height="14"/></span></div>
		<div class="sys-item" ref="sysItem">
		    <div class="opt-item"  @click="toRouter('/authorize')"><img src="sq1.png" height="16" /><span class="mgl-8">Authorization</span></div>
		    <div class="opt-item"  @click="toRouter('/rule')" v-show="false"><img src="rule.png" height="16"/><span class="mgl-8">{{$t('rule')}}</span></div>
		    <div class="opt-item" v-if="code"  @click="showCode"><img src="code.png" height="16"/><span class="mgl-8">{{$t('myCode')}}</span></div>
		    <div class="opt-item" v-if="code"  @click="clearCache"><img src="code.png" height="16"/><span class="mgl-8">{{$t('clearcache')}}</span></div>
	</div></div>`,
	mixins:[window.myMixin],
	data(){
		return {
			code:"",
			lang:sessionStorage.locale=='en-US'?"en-US":"zh-CN",
			timer:null
		}
	},
	mounted(){

		this.timer = setInterval(()=>{
			if(window.ethereum.selectedAddress) {
				clearInterval(this.timer);
				this.getCode();
			}
		},200);
	},
	methods:{
		showMenu(){
			$(this.$refs.sysItem).slideToggle();
		},
		toRouter(path){
			this.$router.push(path);
		},
		showCode(){
            this.$showCode({
            	code:this.code,
            	myCode:this.$i18n.t("myCode"),
            	copy:this.$i18n.t("copy"),
            	copysuccess:this.$i18n.t("copysuccess"),
            	copyfail:this.$i18n.t("copyfail")
            })
        },
        async getCode(){
			try{
				this.code = await getMyCode(this.usToken);
			}catch(err){
				this.$popup({content: err})
			}
		},
		clearCache(){
			localStorage.clear();
			sessionStorage.clear();
			this.$popup({content: "Cache clearance successful"});
			this.showMenu();
		}
	}
}
window.Home = {
	template:`<div class="page-wrapper page-home" v-show="showHome">
		<div class="maintain" v-show="!isSafe || isSettle">{{isSettle?"Not allowed to invest in liquidation":$t('projectmaintenance')}}<span class="close-maintain" @click="isSafe=true"></span></div>
		<v-title></v-title>
		<div class="ushare-logo-area">
			<span class="logo"><img src="logo.png" width="45"/></span>
			<span class="grow logo-desc">
				{{$t('platformdesc')}}
			</span>
		</div>
		<div class="tab-card-box">
			<div class="tab-card flex">
				<ul class="wrate-50" >
					<li v-if="!isSpecial" class="mgb-10">
						<div class="item-label">{{$t('investment')}}</div>
						<div class="item-value">{{Number(account.totalInvestAmount)}}</div>
					</li>
					<li>
						<div class="item-label">{{$t('interestincome')}}</div>
						<div class="item-value">{{Number(account.totalInterestAmount)}}</div>
					</li>
				</ul>
				<ul class="wrate-50">
					<li>
						<div class="item-label">{{$t('rebateincome')}}</div>
						<div class="item-value">{{Number(account.totalShareGainAmount)}}</div>
					</li>
					<li v-if="!isSpecial" class="mgt-10">
						<div class="item-label">{{$t('responserate')}}</div>
						<div class="item-value" style="color:#fdaf2b;" v-if="!Number(account.totalInvestAmount)">0%</div>
						<div class="item-value" style="color:#fdaf2b;" v-else>{{(accDiv(accAdd(Number(account.totalShareGainAmount),Number(account.totalInterestAmount)),Number(account.totalInvestAmount))*100).toFixed(2)}}%</div>
					</li>
				</ul>
			</div>
		</div>
		<div class="tab-card-box mgt-10 hide" ref="mytz">
			<div class="tab-card">
				<div class="form-item">
					<div>{{$t('investmentamount')}}</div>
					<div class="bg-black flex">
						<span class="grow">
							<input type="text" class="input" :placeholder="$t('pleaseenteramount')" v-model="usdtAmount"  maxLength="9"/>
						</span>
						<span>USDT</span>
					</div>
				</div>
				<div class="form-item mgt-20">
					<div>{{$t('invitationcode')}}</div>
					<div class="bg-black"><input type="text" :placeholder="$t('pleaseentercode')" v-model="invateCode"  maxLength="30"/></div>
				</div>
				<div class="mgt-20">
					<button class="btn ripple"  @click="touzhi"><img src="loading.png" height="18" class="loop mgr-4" v-show="requestFlag"/>{{requestFlag?$t('investing'):$t('investmenting')}}</button>
				</div>
			</div>
		</div>
		<div class="tab-card-box mgt-10 hide" ref="mytzing">
			<div class="tab-card mytzing">
				<div class="has-bottom-border flex"><span class="grow" style="color:#eeb409">Investment period {{peddingRecord.id}}</span><span class="status-tag" v-if="peddingRecord.state">{{$t(peddingRecord.state)}}</span></div>
				<ul class="has-bottom-border">
					<li>
						<span class="label">OrderNo：</span>
						<span class="li-value" style="color:#75d1e6;">{{account.keyId.slice(0,20)}}...</span>
					</li>
					<li>
						<span class="label">{{$t('investmentordertime')}}：</span>
						<span class="li-value" v-html="millSecondToDate(peddingRecord.investTime*1000,true)"></span>
					</li>
					<li>
						<span class="label">{{$t('investmentamount')}}：</span>
						<span class="li-value">{{peddingRecord.capital?Number(peddingRecord.capital):0}} <span class="gray-text">USDT</span></span>
					</li>
				</ul>
				<div>
					<div class="form-item">
						<div class="bg-black flex">
							<span class="grow">
								<input type="text" class="input" :placeholder="$t('pleaseenteramount')" v-model="usdtAmount" maxLength="9"/>
							</span>
							<span>USDT</span>
						</div>
					</div>
					<div class="mgt-20">
						<button class="btn ripple"  @click="renewOrder"><img src="loading.png" height="18" class="loop mgr-4" v-show="requestFlag1"/>{{requestFlag1?$t('renewal'):$t('renew')}}</button>
					</div>
				</div>
			</div>
		</div>

		<div class="tab-card-box mgt-10 hide"  ref="interest">
			<div class="tab-card mytzing">
				<div class="has-bottom-border" style="color:#eeb409">Interest income</div>
				<ul>
					<li>
						<span class="label">{{$t('amountreceived')}}：</span>
						<span class="li-value">{{peddingRecord.interestGain?Number(peddingRecord.interestGain):0}} <span class="gray-text">USDT</span></span>
					</li>
					<li class="flex">
						<span class="label">{{$t('pendinginterest')}}：</span>
						<span class="li-value">{{peddingRecord.shouldRecInterest?Number(peddingRecord.shouldRecInterest):0}} <span class="gray-text">USDT</span></span>
						<span class="flex" v-if="Number(peddingRecord.shouldRecInterest)>0">
							<span class="plain-btn mgl-8 flex ripple" @click="receiveIncome(1)" style="height:24px;" v-show="!requestFlag">
								<span>{{$t('receive')}}</span>
							</span>
							<span v-show="requestFlag" class="flex gray-text mgl-4"><img src="loading2.png" height="14" class="loop" /><span class="mgl-4">{{$t('receiving')}}...</span></span>
						</span>
					</li>
				</ul>
			</div>
		</div>

		<div class="tab-card-box mgt-10 hide" ref="commission">
			<div class="tab-card mytzing">
				<div class="has-bottom-border" style="color:#eeb409">Commission income</div>
				<ul>
					<li class="flex">
						<span class="label">{{$t('amountreceived')}}：</span>
						<span class="li-value">{{accountMoney.received}} <span class="gray-text">USDT</span></span>
					</li>
					<li class="flex">
						<span class="label">{{$t('pendinginterest')}}：</span>
						<span class="li-value">{{accountMoney.receivable}} <span class="gray-text">USDT</span></span>
						<span v-if="accountMoney.receivable>0">
							<span class="plain-btn flex" @click="receiveIncome(2)">
								<img src="loading.png" height="14" class="loop mgr-4" v-show="requestFlag4"/>{{requestFlag4?$t('receiving'):$t('receive')}}
							</span>
						</span>
					</li>
					<li class="flex mgt-10" v-show="accountMoney.salvable>0">
						<span class="label">Saveable：</span>
						<span class="li-value">{{accountMoney.salvable}} <span class="gray-text">USDT</span></span>
						<span>
							<span class="plain-btn mgl-8 flex ripple" @click="dialogFlag=true"><span>{{$t('save')}}</span></span>
						</span>
					</li>
				</ul>
			</div>
		</div>
		
		<div class="jszc mgt-10 hide" ref="jszc">
			<div class="grow">
				<div class="title flex text-left has-bottom-border">
					<img src="jszc.png" width="16" />
					<span class="mgl-16 grow">{{$t('technicalsupport')}}</span>
					<span v-show="shouldRect>0">
						<span class="plain-btn mgl-8 flex" @click="serviceMoney" style="height:24px;" v-show="!requestFlag2">
							<span>{{$t('receive')}}</span>
						</span>
						<span v-show="requestFlag2" class="flex gray-text mgl-4"><img src="loading2.png" height="18" class="loop" /><span class="mgl-4">{{$t('receiving')}}...</span></span>
					</span>
				</div>
				<ul class="flex">
					<li class="wrate-50">
						<div class="item-label gray-text">{{$t('amountdue')}}</div>
						<div class="item-value">{{shouldRect}}</div>
					</li>
					<li  class="wrate-50">
						<div class="item-label gray-text">{{$t('amountreceived')}}</div>
						<div class="item-value">{{arealyRect}}</div>
					</li>
				</ul>
			</div>
		</div>


		<div class="jszc mgt-10 hide" ref="releaseAddr">
			<div class="grow">
				<div class="title flex text-left has-bottom-border">
					<img src="jszc.png" width="16" />
					<span class="mgl-16 grow">Release amount</span>
					<span>
						<span class="plain-btn mgl-8 flex" @click="releaseAmounts" style="height:24px;" v-show="!requestFlag2">
							<span>{{$t('receive')}}</span>
						</span>
						<span v-show="requestFlag2" class="flex gray-text mgl-4"><img src="loading2.png" height="18" class="loop" /><span class="mgl-4">{{$t('receiving')}}...</span></span>
					</span>
				</div>
				<ul class="flex">
					<li class="wrate-50">
						<div class="item-label gray-text">Receivable</div>
						<div class="item-value">{{shouldRelease}}</div>
					</li>
					<li  class="wrate-50">
						<div class="item-label gray-text">Received</div>
						<div class="item-value">{{recdRelease}}</div>
					</li>
				</ul>
			</div>
		</div>

		<div>
			<div class="tab-card-pool">
				<div class="pool-title">
					<span><img src="title.png" height="16" /></span>
					<span class="grow mgl-4" style="color:#eeb409">{{$t('prizepool')}}</span>
					<span style="font-size:16px;">{{isNaN(todayPoolMoney)?"--":Number(todayPoolMoney)}} USDT</span>
				</div>	
				<table>
					<tr>
						<th>{{$t('rank')}}</th>
						<th>{{$t('address')}}</th>
						<th>{{$t('recommend')}}</th>
					</tr>
					<tr v-for="(item,i) in rankingList">
						<td>
							<img  :src="(i+1)+'.png'" height="20" />
						</td>
						<td>
							<span v-if="item.address=='--'">--</span>
							<span v-else-if="item.address.startsWith('0x000')">--</span>
							<span v-else>
								{{item.address.slice(0,5)+"***"+item.address.slice(item.address.length-5)}}
							</span>
						</td>
						<td>{{isNaN(item.number)?"--":Number(item.number)}}</td>
					</tr>
				</table>
			</div>
			<div class="link-row mgt-10" @click="toRouter('/leaderboard')">
				<span><img src="prev.png" width="20" /></span>
				<span class="grow mgl-16">{{$t('previousawards')}}</span>
			</div>
		</div>
		<div class="link-row mgt-10"  @click="toRouter('/team')"  v-if="account.state==1"  ref="myteam">
			<span><img src="team.png" width="20" /></span>
			<span class="grow mgl-16">{{$t('myteam')}}</span>
		</div>
		<div class="invite-code-wrapper" v-if="showRecAmount">
		    <div class="mask" @click.stop="showRecAmount=false"></div>
		    <div class="fadeInUp content-body">
	            <div class="flex text-left title">{{$t('pickupaddress')}}</div>
	            <div>
	            	<textarea class="textarea" v-model="receiveAddr" :placeholder="$t('enterpickupaddress')"></textarea>
	            </div>
	            <div class="confirm-footer flex">
	            	<span @click="showRecAmount=false">{{$t('cancel')}}</span>		
	            	<span @click="recAmount">{{$t('determine')}}</span>		
	            </div>
	        </div>
		</div>
		<div class="confirm-dialog-wrapper" v-show="dialogFlag">
			<div class="confirm-mask"></div>
			<div class="confirm-box fadeInUp">
				<div class="confirm-title flex text-left">
					<span style="margin-left:10px;">{{$t('prompt')}}</span>
					<span class="icon-close-dialog" @click="dialogFlag=false"></span>	
				</div>
				<div class="confirm-content">
					Please renew investment to withdraw full income by today
				</div>
			</div>
	    </div>
		<div class="tab-card-box mgt-10" v-show="isSettle && proState.state!=0">
			<div class="tab-card flex">
				<span class="grow">
					<div>{{$t('projectliquidation')}}</div>
					<div class="mgt-6" v-show="proState.state==1">{{$t('availableamount')}}<span class="mgl-16">{{Number(proState.amount)}} USDT</span></div>
				</span>
				<span v-show="proState.state!=1">{{$t('amountreceived')}}<span class="mgl-16">{{Number(proState.amount)}} USDT</span></span>
				<span class="plain-btn flex" @click="receiveIncome(3)" v-if="proState.state==1">
					<img src="loading.png" height="14" class="loop mgr-4" v-show="requestFlag3"/>{{requestFlag3?$t('receiving'):$t('receive')}}
				</span>
			</div>
		<div>
	</div>`,
	components: {
        "v-title":window.Title
    },
	data(){
		return {
			showHome:false,
			type:0,
			account:{
				totalInvestAmount:0,
				totalShareGainAmount:0,
				totalInterestAmount:0,
				keyId:"",
				state:0
			},
			peddingRecord:{
				investTime:0,
				state:""
			},
			usdtAmount:"",
			invateCode:"",
			timer:"",
			requestFlag:false,
			requestFlag1:false,
			requestFlag2:false,
			requestFlag3:false,
			requestFlag4:false,
			isSpecial:localStorage.isSpecial?localStorage.isSpecial:false,
			isTech:localStorage.isTech?localStorage.isTech:false,
			shouldRect:0,
			arealyRect:0,
			receiveAddr:"",
			showRecAmount:false,
			dialogFlag:false,
			isSafe:true,
			isSettle :false,
			isReleaseAddr:localStorage.isReleaseAddr?localStorage.isReleaseAddr:false,
			shouldRelease:"--",
			recdRelease:"--",
			proState:{
				state : 0,
				amount : 0
			},
			accountMoney:{
				received : 0,
				receivable : 0,
				salvable:0
			},
			rankingList:[],
			todayPoolMoney:"--"

		}
	},
	mixins:[window.myMixin],
	mounted(){
		let param = this.$route.query;
		if(param.code){
			this.invateCode = param.code;
		}
		this.timer = setInterval(()=>{
		 	if(window.ethereum.selectedAddress) {
		 		if(window.ethereum.isMetaMask) {
		 			window.ethereum.on('accountsChanged',function(accounts){
						localStorage.clear();
						sessionStorage.clear();
						location.reload();
					});
		 		}
		 		if(localStorage.selectedAddress!=window.ethereum.selectedAddress){
		 			localStorage.clear();
		 			sessionStorage.clear();
		 			location.reload();
		 		}
		 		clearInterval(this.timer);
		 		this.receiveAddr = window.ethereum.selectedAddress;
		 		sessionStorage.selectedAddress = window.ethereum.selectedAddress;
		 		localStorage.selectedAddress = window.ethereum.selectedAddress;
		 		this.initSpecial();
	 			this.usdtQuota();
	 			this.getIntializeInfo();
	 			this.getOneDayPrizeRecord();
	 			setTimeout(()=>{
	 				this.showHome = true;
	 			},200)
		 	}
		},300);
	},
	methods: {
		async getOneDayPrizeRecord(){
			try{
				this.rankingList = await getRealInviteData(nowDay(),this.usToken);
				this.todayPoolMoney = await getJackpot(nowDay(),this.usToken);
			}catch(err){
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
		},
		async getIntializeInfo(){
			try{
       			let res = await getIntializeInfo(this.usToken);
       			this.isSafe = res.isSafe;
       			sessionStorage.isSafe = res.isSafe;
       			this.isSettle = res.isSettle;
       			if(this.isSettle){
       				let data = await settlementTable(this.usToken);
       				this.proState = data;
       			}

       		}catch(err){
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
		},
		receiveIncome(type){
			this.type = type;
			this.showRecAmount = true;
		},
       	toRouter(path){
       		this.$router.push(path);
       	},
       	async recAmount(){
       		if(this.type==1){
       			this.lqMoney();
       		}else if(this.type==2){
       			this.rechargeShareGain();
       		}else if(this.type==3){
       			this.recSettlement();
       		}
       	},
       	async recSettlement(){
       		try{
       			if(!this.receiveAddr){
       				this.$popup({content:this.$i18n.t("enterpickupaddress")});
       			}else{
	       			this.showRecAmount = false;
	       			this.requestFlag3 = true;
	       			let hash = await recSettlement(this.receiveAddr,this.usToken);
	       			if(hash){
						this.timer = setInterval(()=>{
		            		getTransactionReceipt(hash).then(res=>{
			            		if(res){
			            			window.clearInterval(this.timer);
			            			this.$popup({content:this.$i18n.t('successfullyreceived')});
			            			setTimeout(()=>{
			            				this.requestFlag3 = false;
			            				location.reload();
			            			},3000)
			            		}
			            	}).catch(err =>{
			            		window.clearInterval(this.timer);
				            	this.$popup({content:err});
				        	});
		            	},2000);
					}
       			}
       		}catch(err){
       			this.requestFlag3 = false;
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
       	},
       	async rechargeShareGain(){
       		try{
				if(!this.receiveAddr){
	   				this.$popup({content:this.$i18n.t("enterpickupaddress")});
	   			}else{
	   				this.showRecAmount = false;
	   				if(!this.isSafe){
	   					this.$popup({content: this.$i18n.t("maintenancedesc")});return
	   				}else{
	   					this.requestFlag4 = true;
		       			let hash = await rechargeShareGain(this.receiveAddr,this.usToken); 
		       			if(hash){
							this.timer = setInterval(()=>{
			            		getTransactionReceipt(hash).then(res=>{
			            			console.log(res);
				            		if(res){
				            			window.clearInterval(this.timer);
				            			this.$popup({content:this.$i18n.t('successfullyreceived')});
				            			setTimeout(()=>{
				            				this.requestFlag4 = false;
				            				location.reload();
				            			},3000)
				            		}
				            	}).catch(err =>{
				            		window.clearInterval(this.timer);
				            		this.$popup({content:err});
				        		});
			            	},2000);
						}
	   				}
	   			}
       		}catch(err){
       			this.requestFlag4 = false;
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
       	},
       	async initSpecial(){
       		let type = await isSpecial(this.usToken);
       		this.isSpecial = type.isSpecial;
       		this.isTech =  type.isTech;
       		this.isReleaseAddr = type.isReleaseAddr;
       		localStorage.isTech = type.isTech;
       		localStorage.isSpecial = type.isSpecial;
       		localStorage.isReleaseAddr = type.isReleaseAddr;
       		this.getAccount();
       		if(type.isTech){
	       		this.shouldRect = await shouldRecTechGain(this.usToken);
	       		this.arealyRect = await recedTechGain(this.usToken);
       			$(this.$refs.jszc).show();
       			$(this.$refs.mytz).hide();
       			$(this.$refs.mytzing).hide();
       			$(this.$refs.myteam).hide();
       		}
       		if(this.isReleaseAddr){
       			$(this.$refs.releaseAddr).show();
       			$(this.$refs.mytz).hide();
       			$(this.$refs.mytzing).hide();
       			$(this.$refs.myteam).hide();
       			this.shouldRelease = await shouldRecReleaseGain(this.usToken);
       			this.recdRelease = await recedReleaseGain(this.usToken);
       		}
       	},
       	async touzhi(){
       		try{
       			if(!this.usdtAmount){
       				this.$popup({content: "Please enter the amount"});return;
       			}
       			if(!this.invateCode){
       				this.$popup({content: "Please enter the invitation code"});return;
       			}
       			this.requestFlag = true;
       			let hash = await invest(this.usdtAmount,this.invateCode,this.account,this.usdtToken,this.usToken);
       			if(hash){
					this.timer = setInterval(()=>{
	            		getTransactionReceipt(hash).then(res=>{
		            		if(res){
		            			window.clearInterval(this.timer);
		            			this.$popup({content: this.$i18n.t('successfulinvestment')});
		            			setTimeout(()=>{
		            				location.reload();
		            			},3000)
		            		}
		            	}).catch(err =>{
		            		window.clearInterval(this.timer);
				            this.$popup({content:err});
				        });
	            	},2000);
				}
       		}catch(err){
       			this.requestFlag = false;
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
       	},
       	async releaseAmounts(){
       		try{
       			this.requestFlag2 = true;
       			let hash = await recReleaseGain(this.usToken);
       			if(hash){
					this.timer = setInterval(()=>{
	            		getTransactionReceipt(hash).then(res=>{
	            			console.log(res);
		            		if(res){
		            			window.clearInterval(this.timer);
		            			this.$popup({content:this.$i18n.t('successfullyreceived')});
		            			setTimeout(()=>{
		            				this.requestFlag2 = false;
		            				location.reload();
		            			},3000)
		            		}
		            	}).catch(err =>{
		            		window.clearInterval(this.timer);
				            this.$popup({content:err});
				        });
	            	},2000);
				}
       		}catch(err){
       			this.requestFlag2 = false;
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
       	},
       	//静态收益
        async lqMoney(){
       		try{
       			if(!this.receiveAddr){
       				this.$popup({content:this.$i18n.t("enterpickupaddress")});
       			}else{
       				this.showRecAmount = false;
       				if(!this.isSafe){
       					this.$popup({content: this.$i18n.t("maintenancedesc")});return
       				}else{
       					this.requestFlag = true;
		       			let hash = await rechargeInterest(this.account.keyId,this.receiveAddr,this.usToken);
		       			if(hash){
							this.timer = setInterval(()=>{
			            		getTransactionReceipt(hash).then(res=>{
			            			console.log(res);
				            		if(res){
				            			window.clearInterval(this.timer);
				            			this.$popup({content:this.$i18n.t('successfullyreceived')});
				            			setTimeout(()=>{
				            				this.requestFlag = false;
				            				location.reload();
				            			},3000)
				            		}
				            	}).catch(err =>{
				            		window.clearInterval(this.timer);
				            		this.$popup({content:err});
				            	});
			            	},2000);
						}
       				}
       			}
       		}catch(err){
       			this.requestFlag = false;
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
       	},
       	async getAccount(){
       		try{
       			this.account = await getAccount(window.ethereum.selectedAddress,this.usToken);
       			sessionStorage.account = JSON.stringify(this.account);
       			if(this.account.state==1){
       				if(!this.isSpecial && !this.isTech){
       					$(this.$refs.mytzing).show();
       					$(this.$refs.interest).show();
       					$(this.$refs.commission).show();
       					this.accountMoney = await getShareGainTable(this.account,this.isSpecial,this.usToken);
       					this.peddingRecord = await getPendingRecord(this.account.keyId,this.usToken);
       				}
       			}else{
       				if(!this.isReleaseAddr){
       					$(this.$refs.mytz).show();
       				}
       			}
       			if(this.isSpecial){
       				this.accountMoney = await getShareGainTable(this.account,this.isSpecial,this.usToken);
       				$(this.$refs.commission).show();
       			}

       		}catch(err){
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
       	},
       	async renewOrder(){
       		try{
       			this.dialogFlag = false;
       			if(!this.usdtAmount){
       				this.$popup({content: "Please enter the amount"});return;
       			}
       			this.requestFlag1 = true;
       			var hash = await renew(this.account.keyId,this.peddingRecord,this.usdtAmount,this.usToken);
       			if(hash){
					this.timer = setInterval(()=>{
	            		getTransactionReceipt(hash).then(res=>{
	            			console.log(res)
		            		if(res){
		            			window.clearInterval(this.timer);
		            			this.$popup({content: this.$i18n.t('successfulrenewal')});
		            			setTimeout(()=>{
		            				this.requestFlag1 = false;
		            				location.reload();
		            			},3000)
		            		}
		            	}).catch(err =>{
		            		window.clearInterval(this.timer);
				            this.$popup({content:err});
				        });
	            	},2000);
				}
       		}catch(err){
       			this.requestFlag1 = false;
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
       	},
       	async serviceMoney(){
       		try{
       			var hash = await recTechGain(this.usToken);
       			this.requestFlag2 = true;
       			if(hash){
					this.timer = setInterval(()=>{
	            		getTransactionReceipt(hash).then(res=>{
		            		if(res){
		            			window.clearInterval(this.timer);
		            			this.$popup({content: this.$i18n.t('successfullyreceived')});
		            			setTimeout(()=>{
		            				location.reload();
		            			},3000)
		            		}
		            	}).catch(err =>{
		            		window.clearInterval(this.timer);
				            this.$popup({content:err});
				        });
	            	},2000);
				}
       		}catch(err){
       			this.requestFlag2 = false;
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
       	}
    },
    beforeDestroy () {
		if(this.timer)window.clearInterval(this.timer);
    }
};


window.Authorize = {
	template:'<div class="page-wrapper page-enter">\
		<v-title></v-title>\
		<div class="mgt-10">\
			<div class="flex text-desc font-size-12">{{$t("explanation")}}<br/>{{$t("explanation1")}}<br/>{{$t("explanation2")}}</div>\
			<div class="ui-card flex">\
				<span class="icon-usdt"></span>\
				<span class="grow mgl-8 flex center text-left">USDT</span>\
				<span class="flex center">\
					<span class="pointer auth-btn ripple" style="width:110px;height:30px;border-radius:0;"  @click="operating" v-if="!requestFlag">{{usdtQuota?$t("cacelauthorize"):$t("authorize")}}</span>\
					<span class="pointer flex" @click="operating" v-if="requestFlag"><img src="loading.png" height="18" class="loop mgr-4"/>{{usdtQuota?$t("cacelauthorizeing"):$t("authorizeing")}}</span>\
				</span>\
			</div>\
		</div>\
	<div>',
	mixins:[window.myMixin],
	components: {
        "v-title":window.Title
    },
	data:function(){
		return {
            timer:"",
            requestFlag:false,
            requestFlag1:false,
            usdtQuota:Number(sessionStorage.usdtQuota)
		}
	},
	mounted(){},
	methods:{
		async operating(){
			try{
				if(this.requestFlag)return;
				let q = this.usdtQuota?0:1000000;
				this.requestFlag = true;
				let hash = await approve(this.usToken,q,this.usdtToken); 
				if(hash){
	            	this.timer = setInterval(()=>{
	            		getTransactionReceipt(hash).then(res=>{
		            		if(res){
		            			window.clearInterval(this.timer);
		            			setTimeout(()=>{
		            				this.requestFlag = false;
		            				this.$popup({content: this.usdtQuota?this.$i18n.t('cacelauthorizesuccess'):this.$i18n.t('successfulauthorization')});
		            				this.usdtQuota = sessionStorage.usdtQuota = this.usdtQuota?0:100000;
		            			},3000)
		            		}
		            	}).catch(err =>{
		            		window.clearInterval(this.timer);
				            this.$popup({content:err});
				        });
	            	},2000);
	            }else{
	            	console.log(hash);
	            }
			}catch(err){
				this.requestFlag = false;
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
			}	
		}
	},
	beforeDestroy () {
		if(this.timer)window.clearInterval(this.timer);
    }
};

// MY Team
window.Team = {
	template:`<div class="page-wrapper page-team">
		<v-title></v-title>
		<div class="team-box" ref="teamBox">
			<div class="tab-card-box">
				<div class="tab-card relative">
					<span class="label">{{$t('todayperformance')}}</span>
					<div class="kpi-box">
						<p>{{$t('teamperformance')}}</p>
						<p class="number">{{myTeamIncome.today.kpi}}</p>
					</div>
					<div class="flex">
						<span class="wrate-50 td has-right-line">
							<p>{{$t('myrank')}}</p>
							<p class="number">{{myTeamIncome.today.level}}</p>
						</span>
						<span class="wrate-50 td">
							<p>{{$t('numberofinvitees')}}</p>
							<p class="number">{{myTeamIncome.today.inviteSize}}</p>
						</span>
					</div>
				</div>
			</div>
			<div class="tab-card-box">
				<div class="tab-card relative">
					<span class="label" style="background:#FF8554;">{{$t('yesperformance')}}</span>
					<div class="kpi-box">
						<p>{{$t('teamperformance')}}</p>
						<p class="number">{{myTeamIncome.yes.kpi}}</p>
					</div>
					<div class="flex">
						<span class="wrate-50 td  has-right-line">
							<p>{{$t('myrank')}}</p>
							<p class="number">{{myTeamIncome.yes.level}}</p>
						</span>
						<span class="wrate-50 td">
							<p>{{$t('numberofinvitees')}}</p>
							<p class="number">{{myTeamIncome.yes.inviteSize}}</p>
						</span>
					</div>
				</div>
			</div>
			<div class="refresh-wrapper">
				<span class="refresh-btn flex" @click="refreshData"><img src="refresh.png" :class="{'loop':isReLoadData}"/></span>
			</div>
		</div>
		<div class="loading-pop" v-show="isReLoadData"><div class="flex text-wrapper"><img src="loading1.png" class="loop" width="26"/><span>It will take a few seconds to update performance, please be patient...</span></div></div>
	<div>`,
	mixins:[window.myMixin],
	components: {
        "v-title":window.Title
    },
	data(){
		return {
			active:1,
			myTeamIncome:{
				today:{
					kpi:"--",
					level:"--",
					inviteSize:"--"
				},
				yes:{
					kpi:"--",
					level:"--",
					inviteSize:"--"
				}
			},
        	isReLoadData:false
		}
	},
	mounted(){
		if($(window).width()>500){
			$(this.$refs.teamBox).height($("#app").height() - 50);
		}else{
			$(this.$refs.teamBox).height($(window).height() - 50);
		}
		setTimeout(()=>{this.getMyTeam();},1000)
	},
	methods:{
		async getMyTeam(){
			try{	
				if(localStorage.MyTeamIncome && sessionStorage.account){
					let data = JSON.parse(localStorage.MyTeamIncome);
					this.myTeamIncome = data;
				}else{
					account = await getAccount(window.ethereum.selectedAddress,this.usToken);
	       			sessionStorage.account = JSON.stringify(account);
	       			this.getTeamData(account);
				}
       		}catch(err){
       			this.$popup({content: err})
       		}
		},
		async getTeamData(account,callback){
			let data = await getMyTeam(window.ethereum.selectedAddress,account,this.usToken);
			this.myTeamIncome = data;
			localStorage.MyTeamIncome = JSON.stringify(data);
			callback && callback();
		},
		async refreshData(){
			this.isReLoadData = true;
			let account = sessionStorage.account?JSON.parse(sessionStorage.account):"";

			setTimeout(async()=>{
				if(!account){
					account = await getAccount(window.ethereum.selectedAddress,this.usToken);
					sessionStorage.account = JSON.stringify(account);
					this.getTeamData(account,()=>{
						this.isReLoadData = false;
						this.$popup({content:this.$i18n.t('refreshsuccess')});
					});
				}else{
					this.getTeamData(account,()=>{
						this.isReLoadData = false;
						this.$popup({content:this.$i18n.t('refreshsuccess')});
					});
				}
			},2000)
			
		}
	}
};

window.Leaderboard = {
	template:`<div class="page-wrapper page-leaderboard">
		<v-title></v-title>
		<div class="top-content-wrapper">
			<div style="color:#7B715C;">{{$t('yesterdayprizepool')}}</div>
			<div style="font-size:20px;color:#000;margin-top:4px;">{{poolMoney=='--'?"--":Number(poolMoney)}} USDT</div>
		</div>
		<div class="ui-card" style="margin-top:10px;margin-bottom:20px;">
			<div>
				<table>
					<tr>
						<th>{{$t('rank')}}</th>
						<th>{{$t('address')}}</th>
						<th>{{$t('reward')}}</th>
					</tr>
					<tr v-for="(item,i) in list">
						<td>
							<span v-if="i<6">
								<img :src="(i+1)+'.png'" height="20" />
							</span>
							<span v-else>{{i+1}}</span>
						</td>
						<td>
							<span v-if="item.address=='--'">--</span>
							<span v-else-if="item.address.startsWith('0x00')">--</span>
							<span v-else>
								{{item.address.slice(0,5)+"***"+item.address.slice(item.address.length-5)}}
							</span>
						</td>
						<td style="color:#D29F0D;">{{isNaN(item.amount)?"--":Number(item.amount)}}</td>
					</tr>
				</table>
			</div>
		</div>
	</div>`,
	mixins:[window.myMixin],
	data(){
		return {
			list:[
				
			],
			poolMoney:"--"
		}
	},
	components: {
        "v-title":window.Title
    },
    mounted(){
    	this.getOneDayPrizeRecord();
    },
	methods:{
		async getOneDayPrizeRecord(){
			try{
				let res = await getOneDayPrizeRecord(nowDay()-1,this.usToken);
				console.log(res);
				this.poolMoney = await getJackpot(nowDay()-1,this.usToken);
				this.list.push(res.p1);
				this.list = [...this.list,...res.p2,...res.p3,...res.h1];
			}catch(err){
       			if(err.code && err.code == 4001) {
       				return;
       			}else{
       				this.$popup({content: err})
       			}
       		}
		}	
	}
}


/*
<div class="invite-code-wrapper" v-if="showTips">
		    <div class="mask" @click.stop="showTips=false"></div>
		    <div class="fadeInUp content-body">
	            <div class="flex text-left title">{{$t('pickupaddress')}}</div>
	            <div>
	            	<textarea class="textarea" v-model="receiveAddr" :placeholder="$t('enterpickupaddress')"></textarea>
	            </div>
	            <div class="confirm-footer flex">
	            	<span @click="showTips=false">{{$t('cancel')}}</span>		
	            	<span @click="lqMoney">{{$t('determine')}}</span>		
	            </div>
	        </div>
		</div>*/