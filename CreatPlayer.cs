using PathologicalGames;
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public class CreatPlayer : MonoBehaviour
{
	public static CreatPlayer instance;
	public GameObject playerCharacter;
	public  Rigidbody2D m_Rigidbody;
	//摇杆
	public Joystick joystick;
	//pool缓存池里的部件预制体
	public GameObject playParts;
	public GameObject land;//墓碑
	//角色信息
	private PlayerInfo player;
	//纸娃娃字典工厂
	private PlayerParts playerParts;
	// Item工厂
	private Item item;
	//角色所有部件
	private GameObject body;
	private GameObject arm;
	private GameObject armOverHair;
	private GameObject hand;
	private GameObject lHand;
	private GameObject rHand;
	private GameObject head;
	private GameObject face;
	private GameObject hair;
	private GameObject hairOverHead;
	private GameObject hairBelowBody;
	private GameObject backHair;
	private GameObject backHairBelowCap;
	private GameObject coatMail;
	private GameObject coatMailArm;
	private GameObject coatMailArmOverHair;
	private GameObject pants;
	private GameObject weaponEffect; //武器特效
	private GameObject weapon; //武器本体
	//层级字典
	private Dictionary<string, int> zmapDict;
	//部件层级 Z轴
	private int body_zmap;
    private int arm_zmap;
    private int armOverHair_zmap;
    private int hand_zmap;
    private int lHand_zmap;
    private int rHand_zmap;
    private int head_zmap;
    private int face_zmap;
	private int hair_zmap;
	private int hairOverHead_zmap;
	private int hairBelowBody_zmap;
	private int backHair_zmap;
	private int backHairBelowCap_zmap;
	private int coatMail_zmap;
	private int coatMailArm_zmap;
	private int coatMailArmOverHair_zmap;
	private int pants_zmap;
	private int weapon_zmap;
	private int weaponEffect_zmap;
	//一些角色身上用到的缓存图集
	private CharImg bodyCharImg;
	private CharImg headCharImg;
	private CharImg faceCharImg;
	private CharImg hairCharImg;
	private CharImg armCharImg;


	/// <summary>
	/// [动作播放]
	/// </summary>
	private int delay; //当前帧显示时长
	private string action; //当前动作
	private int animCountFrame; //当动作总帧数
	private int currentFrame = 0; //当前帧
	private bool isBack = false; //当前动作是否头是背面
	private bool isPauseMotionAnimate;// [是否暂停动作动画播放]
	private bool isPlayOneTime = false;// [是否只播放一次动画]
	private bool isAttacking;// [是否正在攻击中]
	private bool isFly; //[水中或者飞行状态]
	private string currentAnim = "";
	private string lastAnim = "";
	private float alertTime = 0;
	private bool alertStatus = false;

	private Coroutine playingActionAnimate;// [播放中的动画任务]
	private readonly UnityEvent OnPlayStartEvents = new UnityEvent(); // [动画刚开始执行时调用的事件]
	private readonly UnityEvent OnPlayCompletedEvents = new UnityEvent();// [动画完整执行一次之后调用的事件]

	/// <summary>
	/// [表情播放]
	/// </summary>
	private int delayFace; //当前帧显示时长
	private bool playFace = false; //是否播放表情
	private string faceAction = "default"; //当前表情
	private int animFaceCountFrame; //当动画总帧数
	private int faceCurrentFrame = 0; //当前表情帧
	private float 表情播放计时器;
	private float 表情播放总时间 = 5;
	private float 眨眼计时器;
	private float 眨眼次数;

	private int 测试动作index = 0;


	/// <summary>
	/// [攻击动画名, key = 武器xml中的attack值, value = 动画名称数组, 如果是弓或弩会有第二组没有箭矢的动画]
	/// </summary>
	private readonly Dictionary<sbyte, string[][]> attackTypes = new Dictionary<sbyte, string[][]> {
        //[S1A1M1D] Stance::Id::STABO1, Stance::Id::STABO2, Stance::Id::SWINGO1, Stance::Id::SWINGO2, Stance::Id::SWINGO3
        {1, new string[][]{ new string[] { "stabO1", "stabO2", "swingO1", "swingO2", "swingO3" } } },
        //[SPEAR(矛)]Stance::Id::STABT1, Stance::Id::SWINGP1
        {2, new string[][]{ new string[] { "stabT1", "swingP1" } } },
        //[BOW(弓)]Stance::Id::SHOOT1
        {3, 
            //[没有箭时Stance::Id::SWINGT1, Stance::Id::SWINGT3]
            new string[][]{
				new string[] { "shoot1" },
				new string[] { "swingT1", "swingT3" }
			}
		},
        //[CROSSBOW(弩)]Stance::Id::SHOOT1
        {4, 
            //[没有箭时Stance::Id::SWINGT1, Stance::Id::STABT1]
            new string[][]{
				new string[] { "shoot2" },
				new string[] { "swingT1", "stabT1" }
			}
		},
        //[S2A2M2]Stance::Id::STABO1, Stance::Id::STABO2, Stance::Id::SWINGT1, Stance::Id::SWINGT2, Stance::Id::SWINGT3
        {5, new string[][]{ new string[] { "stabO1", "stabO2", "swingT1", "swingT2", "swingT3" } } },
        //[WAND(魔杖)]Stance::Id::SWINGO1, Stance::Id::SWINGO2
        {6, new string[][]{ new string[] { "swingO1", "swingO2" } } },
        //[CLAW(爪或拳套)]Stance::Id::SWINGO1, Stance::Id::SWINGO2
        {7, new string[][]{ new string[] { "swingO1", "swingO2" } } },
        //[拳套(015没有)]
        {8, new string[][]{ new string[] { "swingO1", "swingO2" } } },
	};


    public string Action { get => action; set => action = value; }
    public bool IsAttacking { get => isAttacking; set => isAttacking = value; }
    public bool IsPauseMotionAnimate { get => isPauseMotionAnimate; set => isPauseMotionAnimate = value; }

    private void Awake()
	{
		instance = this;
	}

    private void Start()
    {
		body = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		arm = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		armOverHair = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		hand = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		lHand = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		rHand = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		head = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		face = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		hair = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		hairOverHead = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		hairBelowBody = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		backHair = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		backHairBelowCap = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		coatMail = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		coatMailArm = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		coatMailArmOverHair = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		pants = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
		weaponEffect = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;//武器特效
		weapon = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;//武器本体

		zmapDict = BaseZMAP.Zmap; //初始化部件的Z轴排序
		playerParts = PlayerParts.CreateInstance(); //初始化角色图集字典
		item = Item.CreateInstance(); //初始化Item图集字典
		player = new PlayerInfo(); //初始化角色字典
		player = player.InitEnter();
		OnStandby();
	}

    private void FixedUpdate()
    {
		
	}

    void Update()
    {
		


		//表情检测
		FaceCheck();

		if (isPlayOneTime) {
			return;
		}

		if (Action == "dead")
		{
			/*transform.position = new Vector2(transform.position.x + land.transform.position.x/100,
				transform.position.y + land.transform.position.y/100);*/
			return;
		}

		/*Move();*/
		//待机检测
		AlertCheck();

		if (IsAttacking)
		{
			return;
		}/*
		if (Input.GetKeyDown(KeyCode.X))
		{
			isPlayOneTime = true;
			isAttacking = true;
			ChangeAnim("brandish2");
			return;
		}
		if (Input.GetKeyDown(KeyCode.C))
		{
			isAttacking = true;
			ChangeAnim("dead");
			land = PoolManager.Pools["MyPool"].Spawn(land).gameObject;
			land.transform.position = new Vector3(transform.position.x, transform.position.y + 1, 5);
			land.GetComponent<Animator>().Play("Tomb_Fall");
			return;
		}
		if (Input.GetKeyDown(KeyCode.V))
		{
			isPlayOneTime = true;
			isAttacking = true;
			ChangeAnim("brandish1");
			return;
		}*/


	}

	/// <summary>
	/// 获取一帧纸娃娃
	/// </summary>
	/// <param name="action">动作</param>
	/// <param name="currentFrame">当前帧</param>
	public void GetPaperDoll(string action, int currentFrame) {
		//加载Body -- 非null;
		string bodyID = player.Skincolor;
		CharAction charAction = playerParts.GetCharAction(bodyID, action);
		PartsFrame partsFrame = playerParts.GetPartsFrame(charAction, action, currentFrame);
		animCountFrame = charAction.CountActCountFrame; //当前动作总帧数
		delay = int.Parse(partsFrame.Delay); //当前帧显示的总时长
		CreatBodyAnim(partsFrame.CharImgs);
		//加载Head -- 非null;
		
		string headPath = Gear.getHeadId(bodyID); //headID
		string headAction = partsFrame.Action ?? partsFrame.Name; //根据BodyAction获得对应头部Action
		if (headAction == "dead")
		{
			headAction = "fly";
		}
		//判断Body帧是否是引用，如果是头部也改外引用对应帧,如果不是则使用当前传入帧
		//示例：stabOF动作第一帧引用了swingP2动作第二帧，头部则应该使用swingP2对应头部第二帧
		int headCurrentFrame = (partsFrame.Frame != null) ? int.Parse(partsFrame.Frame) : currentFrame;
		CharAction headCharAction = playerParts.GetCharAction(headPath, headAction);
		PartsFrame headPartsFrame = playerParts.GetPartsFrame(headCharAction, headAction, headCurrentFrame);
		CreatHeadAnim(headPartsFrame.CharImgs);
		// 加载Hair  -- 非null;
		string hairPath = player.Hair; //HairID
		string hairAction = partsFrame.Action ?? partsFrame.Name; //根据BodyAction获得对应发型Action
		if (hairAction == "dead")
		{
			hairAction = "fly";
		}
		int hairCurrentFrame = (partsFrame.Frame != null) ? int.Parse(partsFrame.Frame) : currentFrame;
		CharAction hairCharAction = playerParts.GetCharAction(hairPath, hairAction);
		PartsFrame hairPartsFrame = playerParts.GetPartsFrame(hairCharAction, hairAction, hairCurrentFrame);
		CreatHairAnim(hairPartsFrame.CharImgs);
		//加载表情;
		isBack = headPartsFrame.Action == "back" || headAction == "back";
		LoadFaceAnim(this.faceAction, this.faceCurrentFrame);
		if (action == "dead")
		{ //如果死亡 只加载上半身和头
			return;
		}
		// 加载Coat -- 可null (如果时装不为空则优先渲染时装 , 上衣和套服公用一个字典逻辑);
		string coatPath = (player.CoatCash != null && player.CoatCash != "") ? player.CoatCash : player.Coat;
		if (coatPath != null && coatPath != "") {
			string coatAction = partsFrame.Action ?? partsFrame.Name;
			int coatCurrentFrame = (partsFrame.Frame != null) ? int.Parse(partsFrame.Frame) : currentFrame;
			CharAction coatCharAction = playerParts.GetCharAction(coatPath, coatAction);
			PartsFrame coatPartsFrame = playerParts.GetPartsFrame(coatCharAction, coatAction, coatCurrentFrame);
			CreatCoatAnim(coatPartsFrame.CharImgs);
		}
		// 加载Pants -- 可null (如果是套服穿戴了裤子这里也依旧渲染，具体的穿戴逻辑不在这里处理);
		string pantsPath = (player.PantsCash != null && player.PantsCash != "") ? player.PantsCash : player.Pants;
		if (pantsPath != null && pantsPath != "")
		{
			string pantsAction = partsFrame.Action ?? partsFrame.Name;
			int pantsCurrentFrame = (partsFrame.Frame != null) ? int.Parse(partsFrame.Frame) : currentFrame;
			CharAction pantsCharAction = playerParts.GetCharAction(pantsPath, pantsAction);
			PartsFrame pantsPartsFrame = playerParts.GetPartsFrame(pantsCharAction, pantsAction, pantsCurrentFrame);
			CreatPantsAnim(pantsPartsFrame.CharImgs);
		}
		// 加载武器 -- 可null  
		string weaponPath = (player.WeaponCash != null && player.WeaponCash != "") ? player.WeaponCash : player.Weapon;
		if (weaponPath != null && weaponPath != "")
		{
			if (player.WeaponCash != "")
			{
				//获取武器类型
				string type = player.Weapon.Substring(2, 2);
				string weaponAction = partsFrame.Action ?? partsFrame.Name;
				int weaponCurrentFrame = (partsFrame.Frame != null) ? int.Parse(partsFrame.Frame) : currentFrame;
				CharAction weaponCharAction = playerParts.GetCharAction(weaponPath, weaponAction, type);
				PartsFrame weaponPartsFrame = playerParts.GetPartsFrame(weaponCharAction, weaponAction, weaponCurrentFrame, type);
				CreatWeaponAnim(weaponPartsFrame.CharImgs);
			}
			else {
				//获取武器类型
				string weaponAction = partsFrame.Action ?? partsFrame.Name;
				int weaponCurrentFrame = (partsFrame.Frame != null) ? int.Parse(partsFrame.Frame) : currentFrame;
				CharAction weaponCharAction = playerParts.GetCharAction(weaponPath, weaponAction);
				PartsFrame weaponPartsFrame = playerParts.GetPartsFrame(weaponCharAction, weaponAction, weaponCurrentFrame);
				CreatWeaponAnim(weaponPartsFrame.CharImgs);
			}
			
		}
		// 如果是攻击动作加载刀光 -- 可null  
		if (player.Weapon != null && player.Weapon != "") { 
		
		}
	
	}


	/// <summary>
	/// [加载表情]
	/// </summary>
	private void LoadFaceAnim(string faceAction, int faceCurrentFrame)
	{
		// 加载Face -- 非空 默认Default;只有使用表情或者受伤之类的才改变状态 定义接口单独修改表情
		//背面状态下不显示
		if (!isBack)
		{
			string facePath = player.Face;
			CharAction faceCharAction = playerParts.GetCharAction(facePath, faceAction);
			PartsFrame facePartsFrame = playerParts.GetPartsFrame(faceCharAction, faceAction, faceCurrentFrame);
			this.delayFace = int.Parse(facePartsFrame.Delay); //当前表情延迟
			this.animFaceCountFrame = faceCharAction.CountActCountFrame; //当前表情总帧数
			CreatFaceAnim(facePartsFrame.CharImgs);
		}
	}



	#region 创建动画帧
	private void CreatBodyAnim(Dictionary<string, CharImg> charImgs)
	{
		foreach (var item in charImgs)
		{
			//Debug.Log(item.Key);
			if (item.Key.EndsWith("body"))
			{
				//body =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				bodyCharImg = item.Value;
				body.transform.SetParent(playerCharacter.transform);
				SpriteRenderer body_sprite = body.GetComponent<SpriteRenderer>();
				body_sprite.sprite = bodyCharImg.Sprite;
				float bodyOriginX = int.Parse(bodyCharImg.OriginX) * 0.01f;
				float bodyOriginY = int.Parse(bodyCharImg.OriginY) * 0.01f;
				body.transform.localPosition = new Vector2(body_sprite.sprite.bounds.size.x / 2f - bodyOriginX, (0f - body_sprite.sprite.bounds.size.y) / 2f + bodyOriginY);
				body_zmap = zmapDict[bodyCharImg.Z];
				body.transform.localPosition += new Vector3(0f, 0f, body_zmap * 0.002f);
				body.transform.localScale = new Vector3(1f, 1f, 1f);
			}
		}
		foreach (var item in charImgs)
		{
			if (item.Key.EndsWith("arm"))
			{
				//arm =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				armCharImg = item.Value;
				arm.transform.SetParent(playerCharacter.transform);
				SpriteRenderer arm_sprite = arm.GetComponent<SpriteRenderer>();
				arm_sprite.sprite = armCharImg.Sprite;
				float num1 = int.Parse(armCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(armCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(armCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num4 = int.Parse(armCharImg.MapDicts["navel"]["y"]) * 0.01f;
				arm.transform.localPosition = new Vector2(arm_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - arm_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
				arm.transform.localPosition += new Vector3(num5, 0f - num6);
				arm_zmap = zmapDict[armCharImg.Z];
				arm.transform.localPosition += new Vector3(0f, 0f, arm_zmap * 0.002f);
				arm.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("armOverHair"))
			{
				//armOverHair =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg charImg = item.Value;
				armOverHair.transform.SetParent(playerCharacter.transform);
				SpriteRenderer armOverHair_sprite = armOverHair.GetComponent<SpriteRenderer>();
				armOverHair_sprite.sprite = charImg.Sprite;
				float num1 = int.Parse(charImg.OriginX) * 0.01f;
				float num2 = int.Parse(charImg.OriginY) * 0.01f;
				float num3 = int.Parse(charImg.MapDicts["navel"]["x"]) * 0.01f;
				float num4 = int.Parse(charImg.MapDicts["navel"]["y"]) * 0.01f;
				armOverHair.transform.localPosition = new Vector2(armOverHair_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - armOverHair_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
				armOverHair.transform.localPosition += new Vector3(num5, 0f - num6);
				armOverHair_zmap = zmapDict[charImg.Z];
				armOverHair.transform.localPosition += new Vector3(0f, 0f, armOverHair_zmap * 0.002f);
				armOverHair.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("lHand"))
			{
				//lHand =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg charImg = item.Value;
				lHand.transform.SetParent(playerCharacter.transform);
				SpriteRenderer lHand_sprite = lHand.GetComponent<SpriteRenderer>();
				lHand_sprite.sprite = charImg.Sprite;
				float num1 = int.Parse(charImg.OriginX) * 0.01f;
				float num2 = int.Parse(charImg.OriginY) * 0.01f;
				if (charImg.MapDicts.ContainsKey("navel"))
				{
					float num3 = int.Parse(charImg.MapDicts["navel"]["x"]) * 0.01f;
					float num4 = int.Parse(charImg.MapDicts["navel"]["y"]) * 0.01f;
					lHand.transform.localPosition = new Vector2(lHand_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - lHand_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
					float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
					float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
					lHand.transform.localPosition += new Vector3(num5, 0f - num6);
				}
				else
				{
					lHand.transform.localPosition = new Vector2(lHand_sprite.sprite.bounds.size.x / 2f - num1, (0f - lHand_sprite.sprite.bounds.size.y) / 2f + num2);
				}
				lHand_zmap = zmapDict[charImg.Z];
				lHand.transform.localPosition += new Vector3(0f, 0f, lHand_zmap * 0.002f);
				lHand.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("rHand"))
			{
				//rHand =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg charImg = item.Value;
				rHand.transform.SetParent(playerCharacter.transform);
				SpriteRenderer rHand_sprite = rHand.GetComponent<SpriteRenderer>();
				rHand_sprite.sprite = charImg.Sprite;
				float num1 = int.Parse(charImg.OriginX) * 0.01f;
				float num2 = int.Parse(charImg.OriginY) * 0.01f;
				float num3 = int.Parse(charImg.MapDicts["navel"]["x"]) * 0.01f;
				float num4 = int.Parse(charImg.MapDicts["navel"]["y"]) * 0.01f;
				rHand.transform.localPosition = new Vector2(rHand_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - rHand_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
				rHand.transform.localPosition += new Vector3(num5, 0f - num6);
				rHand_zmap = zmapDict[charImg.Z];
				rHand.transform.localPosition += new Vector3(0f, 0f, rHand_zmap * 0.002f);
				rHand.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("hand"))
			{
				//hand =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg charImg = item.Value;
				hand.transform.SetParent(playerCharacter.transform);
				SpriteRenderer hand_sprite = hand.GetComponent<SpriteRenderer>();
				hand_sprite.sprite = charImg.Sprite;
				float num1 = int.Parse(charImg.OriginX) * 0.01f;
				float num2 = int.Parse(charImg.OriginY) * 0.01f;
				float num3 = int.Parse(charImg.MapDicts["navel"]["x"]) * 0.01f;
				float num4 = int.Parse(charImg.MapDicts["navel"]["y"]) * 0.01f;
				hand.transform.localPosition = new Vector2(hand_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - hand_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
				hand.transform.localPosition += new Vector3(num5, 0f - num6);
				hand_zmap = zmapDict[charImg.Z];
				hand.transform.localPosition += new Vector3(0f, 0f, hand_zmap * 0.002f);
				hand.transform.localScale = new Vector3(1f, 1f, 1f);
			}


		}

	}

	private void CreatHeadAnim(Dictionary<string, CharImg> charImgs)
	{
		foreach (var item in charImgs)
		{

			if (item.Key.EndsWith("head"))
			{
				//head =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				headCharImg = item.Value;
				head.transform.SetParent(playerCharacter.transform);
				SpriteRenderer head_sprite = head.GetComponent<SpriteRenderer>();
				head_sprite.sprite = headCharImg.Sprite;
				float num1 = int.Parse(headCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(headCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(headCharImg.MapDicts["neck"]["x"]) * 0.01f;
				float num4 = int.Parse(headCharImg.MapDicts["neck"]["y"]) * 0.01f;
				head.transform.localPosition = new Vector2(head_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - head_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["neck"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["neck"]["y"]) * 0.01f;
				head.transform.localPosition += new Vector3(num5, 0f - num6);
				head_zmap = zmapDict[headCharImg.Z];
				head.transform.localPosition += new Vector3(0f, 0f, head_zmap * 0.002f);
				head.transform.localScale = new Vector3(1f, 1f, 1f);
			}
		}
	}

	private void CreatFaceAnim(Dictionary<string, CharImg> charImgs)
	{
		foreach (var item in charImgs)
		{
			if (item.Key.EndsWith("face"))
			{
				//face =  PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				//face = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				faceCharImg = item.Value;
				face.transform.SetParent(head.transform);
				SpriteRenderer face_sprite = face.GetComponent<SpriteRenderer>();
				face_sprite.sprite = faceCharImg.Sprite;
				float num1 = int.Parse(faceCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(faceCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(faceCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num4 = int.Parse(faceCharImg.MapDicts["brow"]["y"]) * 0.01f;
				face.transform.localPosition = new Vector2(face_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - face_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(headCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num6 = int.Parse(headCharImg.MapDicts["brow"]["y"]) * 0.01f;
				face.transform.localPosition += new Vector3(num5, 0f - num6);
				face_zmap = zmapDict[faceCharImg.Z];
				face.transform.localPosition += new Vector3(0f, 0f, (face_zmap - head_zmap) * 0.002f);
				face.transform.localScale = new Vector3(1f, 1f, 1f);
			}
		}
	}

	private void CreatHairAnim(Dictionary<string, CharImg> charImgs)
	{
		foreach (var item in charImgs)
		{
			//Debug.Log(item.Key);
			if (item.Key.EndsWith("hair"))
			{
				//hair = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				hairCharImg = item.Value;
				hair.transform.SetParent(head.transform);
				SpriteRenderer hair_sprite = hair.GetComponent<SpriteRenderer>();
				hair_sprite.sprite = hairCharImg.Sprite;
				float num1 = int.Parse(hairCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(hairCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(hairCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num4 = int.Parse(hairCharImg.MapDicts["brow"]["y"]) * 0.01f;
				hair.transform.localPosition = new Vector2(hair_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - hair_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(headCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num6 = int.Parse(headCharImg.MapDicts["brow"]["y"]) * 0.01f;
				hair.transform.localPosition += new Vector3(num5, 0f - num6);
				hair_zmap = zmapDict[hairCharImg.Z];
				hair.transform.localPosition += new Vector3(0f, 0f, (hair_zmap - head_zmap) * 0.002f);
				hair.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("hairOverHead"))
			{
				//hairOverHead = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg hairOverHeadCharImg = item.Value;
				hairOverHead.transform.SetParent(head.transform);
				SpriteRenderer hairOverHead_sprite = hairOverHead.GetComponent<SpriteRenderer>();
				hairOverHead_sprite.sprite = hairOverHeadCharImg.Sprite;
				float num1 = int.Parse(hairOverHeadCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(hairOverHeadCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(hairOverHeadCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num4 = int.Parse(hairOverHeadCharImg.MapDicts["brow"]["y"]) * 0.01f;
				hairOverHead.transform.localPosition = new Vector2(hairOverHead_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - hairOverHead_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(headCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num6 = int.Parse(headCharImg.MapDicts["brow"]["y"]) * 0.01f;
				hairOverHead.transform.localPosition += new Vector3(num5, 0f - num6);
				hairOverHead_zmap = zmapDict[hairOverHeadCharImg.Z];
				hairOverHead.transform.localPosition += new Vector3(0f, 0f, (hairOverHead_zmap - head_zmap) * 0.002f);
				hairOverHead.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("hairBelowBody"))
			{
				//hairBelowBody =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg hairBelowBodyCharImg = item.Value;
				hairBelowBody.transform.SetParent(head.transform);
				SpriteRenderer hairBelowBody_sprite = hairBelowBody.GetComponent<SpriteRenderer>();
				hairBelowBody_sprite.sprite = hairBelowBodyCharImg.Sprite;
				float num1 = int.Parse(hairBelowBodyCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(hairBelowBodyCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(hairBelowBodyCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num4 = int.Parse(hairBelowBodyCharImg.MapDicts["brow"]["y"]) * 0.01f;
				hairBelowBody.transform.localPosition = new Vector2(hairBelowBody_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - hairBelowBody_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(headCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num6 = int.Parse(headCharImg.MapDicts["brow"]["y"]) * 0.01f;
				hairBelowBody.transform.localPosition += new Vector3(num5, 0f - num6);
				hairBelowBody_zmap = zmapDict[hairBelowBodyCharImg.Z];
				hairBelowBody.transform.localPosition += new Vector3(0f, 0f, (hairBelowBody_zmap - head_zmap) * 0.002f);
				hairBelowBody.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("backHair"))
			{
				//backHair =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg backHairCharImg = item.Value;
				backHair.transform.SetParent(head.transform);
				SpriteRenderer backHair_sprite = backHair.GetComponent<SpriteRenderer>();
				backHair_sprite.sprite = backHairCharImg.Sprite;
				float num1 = int.Parse(backHairCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(backHairCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(backHairCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num4 = int.Parse(backHairCharImg.MapDicts["brow"]["y"]) * 0.01f;
				backHair.transform.localPosition = new Vector2(backHair_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - backHair_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(headCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num6 = int.Parse(headCharImg.MapDicts["brow"]["y"]) * 0.01f;
				backHair.transform.localPosition += new Vector3(num5, 0f - num6);
				backHair_zmap = zmapDict[backHairCharImg.Z];
				backHair.transform.localPosition += new Vector3(0f, 0f, (backHair_zmap - head_zmap) * 0.002f);
				backHair.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("backHairBelowCap"))
			{
				//backHairBelowCap =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg backHairBelowCapCharImg = item.Value;
				backHairBelowCap.transform.SetParent(head.transform);
				SpriteRenderer backHairBelowCap_sprite = backHairBelowCap.GetComponent<SpriteRenderer>();
				backHairBelowCap_sprite.sprite = backHairBelowCapCharImg.Sprite;
				float num1 = int.Parse(backHairBelowCapCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(backHairBelowCapCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(backHairBelowCapCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num4 = int.Parse(backHairBelowCapCharImg.MapDicts["brow"]["y"]) * 0.01f;
				backHairBelowCap.transform.localPosition = new Vector2(backHairBelowCap_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - backHairBelowCap_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(headCharImg.MapDicts["brow"]["x"]) * 0.01f;
				float num6 = int.Parse(headCharImg.MapDicts["brow"]["y"]) * 0.01f;
				backHairBelowCap.transform.localPosition += new Vector3(num5, 0f - num6);
				backHairBelowCap_zmap = zmapDict[backHairBelowCapCharImg.Z];
				backHairBelowCap.transform.localPosition += new Vector3(0f, 0f, (backHairBelowCap_zmap - head_zmap) * 0.002f);
				backHairBelowCap.transform.localScale = new Vector3(1f, 1f, 1f);
			}
		}
	}

	private void CreatCoatAnim(Dictionary<string, CharImg> charImgs)
	{
		foreach (var item in charImgs)
		{
			if (item.Key.EndsWith("mail"))
			{
				//coatMail =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg coatMailCharImg = item.Value;
				coatMail.transform.SetParent(playerCharacter.transform);
				SpriteRenderer coatMail_sprite = coatMail.GetComponent<SpriteRenderer>();
				coatMail_sprite.sprite = coatMailCharImg.Sprite;
				float num1 = int.Parse(coatMailCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(coatMailCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(coatMailCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num4 = int.Parse(coatMailCharImg.MapDicts["navel"]["y"]) * 0.01f;
				coatMail.transform.localPosition = new Vector2(coatMail_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - coatMail_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
				coatMail.transform.localPosition += new Vector3(num5, 0f - num6);
				coatMail_zmap = zmapDict[coatMailCharImg.Z];
				coatMail.transform.localPosition += new Vector3(0f, 0f, coatMail_zmap * 0.002f);
				coatMail.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("mailArm"))
			{
				//coatMailArm =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg coatMailArmCharImg = item.Value;
				coatMailArm.transform.SetParent(playerCharacter.transform);
				SpriteRenderer coatMailArm_sprite = coatMailArm.GetComponent<SpriteRenderer>();
				coatMailArm_sprite.sprite = coatMailArmCharImg.Sprite;
				float num1 = int.Parse(coatMailArmCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(coatMailArmCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(coatMailArmCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num4 = int.Parse(coatMailArmCharImg.MapDicts["navel"]["y"]) * 0.01f;
				coatMailArm.transform.localPosition = new Vector2(coatMailArm_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - coatMailArm_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
				coatMailArm.transform.localPosition += new Vector3(num5, 0f - num6);
				coatMailArm_zmap = zmapDict[coatMailArmCharImg.Z];
				coatMailArm.transform.localPosition += new Vector3(0f, 0f, coatMailArm_zmap * 0.002f);
				coatMailArm.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("mailArmOverHair"))
			{
				//coatMailArmOverHair =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg coatMailArmOverHairCharImg = item.Value;
				coatMailArmOverHair.transform.SetParent(playerCharacter.transform);
				SpriteRenderer coatMailArmOverHair_sprite = coatMailArmOverHair.GetComponent<SpriteRenderer>();
				coatMailArmOverHair_sprite.sprite = coatMailArmOverHairCharImg.Sprite;
				float num1 = int.Parse(coatMailArmOverHairCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(coatMailArmOverHairCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(coatMailArmOverHairCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num4 = int.Parse(coatMailArmOverHairCharImg.MapDicts["navel"]["y"]) * 0.01f;
				coatMailArmOverHair.transform.localPosition = new Vector2(coatMailArmOverHair_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - coatMailArmOverHair_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
				coatMailArmOverHair.transform.localPosition += new Vector3(num5, 0f - num6);
				coatMailArmOverHair_zmap = zmapDict[coatMailArmOverHairCharImg.Z];
				coatMailArmOverHair.transform.localPosition += new Vector3(0f, 0f, coatMailArmOverHair_zmap * 0.002f);
				coatMailArmOverHair.transform.localScale = new Vector3(1f, 1f, 1f);
			}

		}
	}

	private void CreatPantsAnim(Dictionary<string, CharImg> charImgs)
	{
		foreach (var item in charImgs)
		{
			if (item.Key.EndsWith("pants"))
			{
				//pants =PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg pantsCharImg = item.Value;
				pants.transform.SetParent(playerCharacter.transform);
				SpriteRenderer pants_sprite = pants.GetComponent<SpriteRenderer>();
				pants_sprite.sprite = pantsCharImg.Sprite;
				float num1 = int.Parse(pantsCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(pantsCharImg.OriginY) * 0.01f;
				float num3 = int.Parse(pantsCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num4 = int.Parse(pantsCharImg.MapDicts["navel"]["y"]) * 0.01f;
				pants.transform.localPosition = new Vector2(pants_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - pants_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				float num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
				float num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
				pants.transform.localPosition += new Vector3(num5, 0f - num6);
				pants_zmap = zmapDict[pantsCharImg.Z];
				pants.transform.localPosition += new Vector3(0f, 0f, pants_zmap * 0.002f);
				pants.transform.localScale = new Vector3(1f, 1f, 1f);
			}

		}
	}


	private void CreatWeaponAnim(Dictionary<string, CharImg> charImgs) {
		foreach (var item in charImgs) {
			if (item.Key.EndsWith("effect")) {
				//weaponEffect = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg weaponEffectCharImg = item.Value;
				if (armCharImg == null)
				{
					weaponEffect.transform.SetParent(transform);
				}
				else
				{
					weaponEffect.transform.SetParent(arm.transform);
				}
				
				SpriteRenderer weaponEffects_sprite = weaponEffect.GetComponent<SpriteRenderer>();
				weaponEffects_sprite.sprite = weaponEffectCharImg.Sprite;
				float num1 = int.Parse(weaponEffectCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(weaponEffectCharImg.OriginY) * 0.01f;
				float num3;
				float num4;
				float num5;
				float num6;
				if (weaponEffectCharImg.MapDicts.ContainsKey("navel"))
				{
					num3 = int.Parse(weaponEffectCharImg.MapDicts["navel"]["x"]) * 0.01f;
					num4 = int.Parse(weaponEffectCharImg.MapDicts["navel"]["y"]) * 0.01f;
					if (armCharImg == null)
					{
						num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
						num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
					}
					else
					{

						num5 = int.Parse(armCharImg.MapDicts["navel"]["x"]) * 0.01f;
						num6 = int.Parse(armCharImg.MapDicts["navel"]["y"]) * 0.01f;
					}

				}
				else
				{
					num3 = int.Parse(weaponEffectCharImg.MapDicts["hand"]["x"]) * 0.01f;
					num4 = int.Parse(weaponEffectCharImg.MapDicts["hand"]["y"]) * 0.01f;
					if (armCharImg == null)
					{
						num5 = int.Parse(bodyCharImg.MapDicts["hand"]["x"]) * 0.01f;
						num6 = int.Parse(bodyCharImg.MapDicts["hand"]["y"]) * 0.01f;
					}
					else
					{

						num5 = int.Parse(armCharImg.MapDicts["hand"]["x"]) * 0.01f;
						num6 = int.Parse(armCharImg.MapDicts["hand"]["y"]) * 0.01f;
					}

				}
				weaponEffect.transform.localPosition = new Vector2(weaponEffects_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - weaponEffects_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				weaponEffect.transform.localPosition += new Vector3(num5, 0f - num6);
				weaponEffect_zmap = zmapDict[weaponEffectCharImg.Z];
				if (armCharImg == null)
				{
					weapon.transform.localPosition += new Vector3(0f, 0f, weaponEffect_zmap * 0.002f);
				}
				else {
					weaponEffect.transform.localPosition += new Vector3(0f, 0f, (weaponEffect_zmap - arm_zmap) * 0.002f);
				}
				weaponEffect.transform.localScale = new Vector3(1f, 1f, 1f);
			}
			if (item.Key.EndsWith("weapon"))
			{
				//weapon = PoolManager.Pools["MyPool"].Spawn(playParts).gameObject;
				CharImg weaponCharImg = item.Value;
				if (armCharImg == null)
				{
					weapon.transform.SetParent(transform);
				}
				else {
					weapon.transform.SetParent(arm.transform);
				}
				SpriteRenderer weapon_sprite = weapon.GetComponent<SpriteRenderer>();
				weapon_sprite.sprite = weaponCharImg.Sprite;
				float num1 = int.Parse(weaponCharImg.OriginX) * 0.01f;
				float num2 = int.Parse(weaponCharImg.OriginY) * 0.01f;
				float num3;
				float num4;
				float num5;
				float num6;
				if (weaponCharImg.MapDicts.ContainsKey("navel"))
				{
					num3 = int.Parse(weaponCharImg.MapDicts["navel"]["x"]) * 0.01f;
					num4 = int.Parse(weaponCharImg.MapDicts["navel"]["y"]) * 0.01f;
					if (armCharImg == null)
					{
						num5 = int.Parse(bodyCharImg.MapDicts["navel"]["x"]) * 0.01f;
						num6 = int.Parse(bodyCharImg.MapDicts["navel"]["y"]) * 0.01f;
					}
					else
					{

						num5 = int.Parse(armCharImg.MapDicts["navel"]["x"]) * 0.01f;
						num6 = int.Parse(armCharImg.MapDicts["navel"]["y"]) * 0.01f;
					}
				
				}
				else {
					num3 = int.Parse(weaponCharImg.MapDicts["hand"]["x"]) * 0.01f;
					num4 = int.Parse(weaponCharImg.MapDicts["hand"]["y"]) * 0.01f;
					if (armCharImg == null)
					{
						num5 = int.Parse(bodyCharImg.MapDicts["hand"]["x"]) * 0.01f;
						num6 = int.Parse(bodyCharImg.MapDicts["hand"]["y"]) * 0.01f;
					}
					else {
						
						num5 = int.Parse(armCharImg.MapDicts["hand"]["x"]) * 0.01f;
						num6 = int.Parse(armCharImg.MapDicts["hand"]["y"]) * 0.01f;
					}
					
				}
				
				weapon.transform.localPosition = new Vector2(weapon_sprite.sprite.bounds.size.x / 2f - num1 - num3, (0f - weapon_sprite.sprite.bounds.size.y) / 2f + num2 + num4);
				weapon.transform.localPosition += new Vector3(num5, 0f - num6);
				
				weapon_zmap = zmapDict[weaponCharImg.Z];
				if (armCharImg == null)
				{
					if (action == "rope" || action == "ladder")
					{
						weapon.transform.localPosition += new Vector3(0f, 0f, (weapon_zmap - body_zmap) * 0.002f);
					}
					else {
						weapon.transform.localPosition += new Vector3(0f, 0f, weapon_zmap * 0.002f);
					}
					
				}
				else {
					weapon.transform.localPosition += new Vector3(0f, 0f, (weapon_zmap - arm_zmap) * 0.002f);
				}
				
				weapon.transform.localScale = new Vector3(1f, 1f, 1f);
			}
		}
	}
	#endregion

	/// <summary>
	/// 【播放表情】
	/// </summary>
	public void PlayFaceAnim(string faceAction) {
		this.faceAction = faceAction;
		if (playFace)
		{
			DespawnFace();
			LoadFaceAnim(faceAction, faceCurrentFrame);
			this.faceCurrentFrame += 1;
			if (animFaceCountFrame < faceCurrentFrame)
			{
				if (faceAction == "blink")
				{
					this.眨眼次数 += 1;
					if (眨眼次数 >= 2)//停止播放
					{
						DespawnFace();
						LoadFaceAnim(faceAction, 0);
						this.playFace = false;
						this.眨眼次数 = 0;
						this.faceAction = "default";
						this.animFaceCountFrame = 0;
						//LoadFaceAnim(faceAction, faceCurrentFrame);
					}
				}
				else {
					if (表情播放计时器 >= 表情播放总时间) {
						DespawnFace();
						LoadFaceAnim(faceAction, 0);
						表情播放计时器 = 0;
						this.playFace = false;
						this.faceAction = "default";
						this.animFaceCountFrame = 0;
					}
				}
				this.faceCurrentFrame = 0;
			}
			if (playFace) {
				//循环播放
				delayFace = (delayFace == 0) ? 200 : delayFace;
				StartCoroutine(AniPlayDone((float)(Mathf.Abs(this.delayFace) * 0.001), () =>
				{
					PlayFaceAnim(faceAction);
				}));
			}
		}
	}
	/// <summary>
	/// 播放动作
	/// </summary>
	public void PlayActionAnim(string nextAnim) {
		if (lastAnim == nextAnim) {
			return;
		}
		Despawn();
		GetPaperDoll(nextAnim, currentFrame);
		playingActionAnimate = StartCoroutine(AniPlayDone((float)(Mathf.Abs(this.delay) * 0.001), () =>
		{
			if (IsPauseMotionAnimate) //动画暂停,维持当前状态
			{
				delay = 2000;
			}
			else
			{
				currentFrame += 1; //没有暂停切换下一帧
				if (animCountFrame < currentFrame) //一次循环结束
				{
					if (isPlayOneTime)//是否只播放一次
					{
						if (IsAttacking) //如果是攻击动作：解除
						{
							IsAttacking = !IsAttacking;
							alertTime = 3;
							alertStatus = true;
						}
						isPlayOneTime = !isPlayOneTime;
						OnAlert();
					}
					else
					{
						currentFrame = 0;
					}
				}
			}
			PlayActionAnim(nextAnim);
		}));

	}
	private IEnumerator AniPlayDone(float sec, Action cb)
	{
		//Debug.Log(sec);
		yield return new WaitForSeconds(sec);
		if (cb != null)
		{
			cb();
		}
	}


	private void Despawn() {
        //切换Sprite
/*        foreach (Transform item in playerCharacter.transform)
        {
			foreach (Transform item1 in item.transform)
			{
				item1.GetComponent<SpriteRenderer>().sprite = null;
			}
			item.GetComponent<SpriteRenderer>().sprite = null;
		}*/
		body.transform.GetComponent<SpriteRenderer>().sprite = null;
		arm.transform.GetComponent<SpriteRenderer>().sprite = null;
		armOverHair.transform.GetComponent<SpriteRenderer>().sprite = null;
		hand.transform.GetComponent<SpriteRenderer>().sprite = null;
		lHand.transform.GetComponent<SpriteRenderer>().sprite = null;
		rHand.transform.GetComponent<SpriteRenderer>().sprite = null;
		head.transform.GetComponent<SpriteRenderer>().sprite = null;
		face.transform.GetComponent<SpriteRenderer>().sprite = null;
		hair.transform.GetComponent<SpriteRenderer>().sprite = null;
		hairOverHead.transform.GetComponent<SpriteRenderer>().sprite = null;
		hairBelowBody.transform.GetComponent<SpriteRenderer>().sprite = null;
		backHair.transform.GetComponent<SpriteRenderer>().sprite = null;
		backHairBelowCap.transform.GetComponent<SpriteRenderer>().sprite = null;
		coatMail.transform.GetComponent<SpriteRenderer>().sprite = null;
		coatMailArm.transform.GetComponent<SpriteRenderer>().sprite = null;
		coatMailArmOverHair.transform.GetComponent<SpriteRenderer>().sprite = null;
		pants.transform.GetComponent<SpriteRenderer>().sprite = null;
		weaponEffect.transform.GetComponent<SpriteRenderer>().sprite = null;
		weapon.transform.GetComponent<SpriteRenderer>().sprite = null;
		bodyCharImg = null;
		headCharImg = null;
		faceCharImg = null;
		hairCharImg = null;
		armCharImg = null;
}

	private void DespawnFace() {
		face.transform.GetComponent<SpriteRenderer>().sprite = null;
	}


	/// <summary>
	/// 切换动作
	/// </summary>
	public void ChangeAnim(string nextAnim) {
		if (playingActionAnimate != null) {
			StopCoroutine(playingActionAnimate);
		}
		Action = nextAnim;
		currentFrame = 0;
		lastAnim = currentAnim; 
		currentAnim = nextAnim;
		PlayActionAnim(nextAnim);
	}
	/// <summary>
	/// 暂停动画播放
	/// </summary>
	public void StopAnim() {
		IsPauseMotionAnimate = true;
	}

	/// <summary>
	/// 恢复动画播放
	/// </summary>
	public void StartAnim()
	{
		IsPauseMotionAnimate = false;
	}

	/// <summary>
	/// 眨眼
	/// </summary>
	public void 眨眼()
	{
		this.playFace = true;
		this.faceCurrentFrame = 0;
		PlayFaceAnim("blink");
	}
	/// <summary>
	///使用表情
	/// <summary>
	public void UseFace(string faceAction) {
		this.playFace = true;
		this.faceCurrentFrame = 0;
		PlayFaceAnim(faceAction);

	}

	public void FaceCheck()
	{
		if (!playFace)
		{
			if (眨眼计时器 > 5)
			{
				眨眼();
				眨眼计时器 = 0;
			}
			else
			{
				眨眼计时器 += Time.deltaTime;
			}
		}
		if (playFace && faceAction != "blink")
		{
			表情播放计时器 += Time.deltaTime;
		}
	}
	//是否进入警戒状态
	public void OnAlert() {
		if (alertStatus && alertTime > 0)
		{
			ChangeAnim("alert");
		}
		else {
			alertStatus = false;
			alertTime = 0;
			OnStandby();
		}
		
	}
	//进入待机状态
	public void OnStandby() {
		if (player.Weapon != null)
		{
			Action = item.GetStand(player.Weapon);
			
		}
		else
		{
			Action = "stand1";
		}
		ChangeAnim(Action);
	}
	//移动状态
	public void MoveState() {
		if (player.Weapon != null)
		{
			Action = item.GetWalk(player.Weapon);
		}
		else
		{
			Action = "walk1";
		}
		ChangeAnim(Action);
	}
	//跳跃
	public void JumpState() {
		Action = "jump";
		ChangeAnim(Action);
	}
	//爬绳子
	public void RopeState() {
		Action = "rope";
		ChangeAnim(Action);
	}

	public void StopState() {
		IsPauseMotionAnimate = true;
	}

	public void StartState()
	{
		IsPauseMotionAnimate = false;
	}

	//趴下
	public void ProneState()
	{
		Action = "prone";
		ChangeAnim(Action);
	}

	//进入飞行或者游泳状态
	public void Onfly() { 
		
	}

	public void AlertCheck() {
		if (alertTime > 0)
		{
			alertTime -= Time.deltaTime;
			if (Action == "stand1" || Action == "stand2")
			{
				OnAlert();
			}
		}
		else if (alertTime <= 0 && alertStatus) {
			OnAlert();
		}
	}
	
	//普攻
	public void attack() {
		if (IsAttacking)
		{
			return;
		}
		string[] str1 = { "coolingeffect", "coolingeffect", "coolingeffect" };
		ChangeAnim(str1[UnityEngine.Random.Range(0, 3)]);
		isPlayOneTime = true;
		IsAttacking = true;
		return;
	}


}
