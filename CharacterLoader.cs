/**
*Copyright(C) 2021 by DefaultCompany
*All rights reserved.
*ProductName:  MapleStory
*Author:  
*Version:      1.0
*UnityVersion: 2020.3.0f1c1
*CreateTime:   2021/05/24 19:45:23
*Description:  [角色渲染]
*/
using System.Collections.Generic;
using TouchControlsKit;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;
using UnityEngine.UI;

public class CharacterLoader : MonoBehaviour
{

    public int skin = 0;
    public int head = 12000;
    public int body = 2000;

    /// <summary>
    /// [值为-1代表未穿戴该装备]
    /// </summary>
    public int face = -1;
    public int hair = -1;
    public int cap = -1;
    public int coat = -1;
    public int pants = -1;
    public int shoes = -1;
    public int weapon = -1;

    public string characterMotion = CharacterMotionConstants.STAND;

    private RectTransform rt;

    private CharacterBean characterBean;
    private PlayerMove playerMove;

    /// <summary>
    /// [角色动作]
    /// </summary>
    private string motion;

    /// <summary>
    /// [动作下标, 播放到哪个动作]
    /// </summary>
    private short motionIndex;

    private GameObject actionOffset;
    private sbyte standId = -1;
    private sbyte walkId = -1;
    private sbyte attackId = -1;
    private string afterImage;
    private string sfx;


    /// <summary>
    /// [是否暂停动作动画播放]
    /// </summary>
    private bool isPauseMotionAnimate;

    /// <summary>
    /// [是否只播放一次动画]
    /// </summary>
    private bool isPlayOneTime;

    /// <summary>
    /// [是否正在攻击中]
    /// </summary>
    private bool isAttacking;

    private Vector2 bodyOrigin = Vector2.zero;


    /// <summary>
    /// [播放中的动画任务]
    /// </summary>
    private Coroutine playingActionAnimate;

    /// <summary>
    /// [动画刚开始执行时调用的事件]
    /// </summary>
    private readonly UnityEvent OnPlayStartEvents = new UnityEvent();

    /// <summary>
    /// [动画完整执行一次之后调用的事件]
    /// </summary>
    private readonly UnityEvent OnPlayCompletedEvents = new UnityEvent();


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

    private CharacterController2D characterController2D;

    public bool IsPauseMotionAnimate { get => isPauseMotionAnimate; set => isPauseMotionAnimate = value; }
    public bool IsAttacking { get => isAttacking; set => isAttacking = value; }


    void Start()
    {
        playerMove = GetComponent<PlayerMove>();
        characterBean = GetComponent<CharacterBean>();
        rt = transform as RectTransform;
        characterController2D = GetComponent<CharacterController2D>();
        head += skin;
        body += skin;
        LoadAll();
    }

    private void Update()
    {
        if (name != GlobalCache.SelectedCharacterUid)
        {
            return;
        }
        //[当输入框获取焦点时不让玩家进行操作]
        if (GyUtils.Instance.IsChatInputFocus())
        {
            return;
        }
#if UNITY_ANDROID || UNITY_IPHONE
        if (TCKInput.GetAction("ctrlBtn", EActionEvent.Down))
        {
            PlayAttackMotion();
            return;
        }
        if (TCKInput.GetAction("ctrlBtn", EActionEvent.Up))
        {
            OnPlayCompletedEvents.AddListener(() => {
                if (!IsAttacking)
                {
                    return;
                }
                IsAttacking = false;
                OnPlayStartEvents.RemoveAllListeners();
                OnPlayCompletedEvents.RemoveAllListeners();
                //[延迟调用可以解决因延迟问题导致的动作切换为站立时坐标不正确的问题]
                GyUtils.Instance.StartDelayExecute(() => characterController2D.OnLandEvent.Invoke());
            });
            return;
        }
        if (TCKInput.GetAction("pickUpBtn", EActionEvent.Down))
        {
            PickUp();
            return;
        }
        if (TCKInput.GetAction("equipBtn", EActionEvent.Down))
        {
            GyUtils.Instance.ShowOrHidePanel("CharEquippedPanel");
            return;
        }
        if (TCKInput.GetAction("itemBtn", EActionEvent.Down))
        {
            GyUtils.Instance.ShowOrHidePanel("CharItemsPanel");
            return;
        }
        if (TCKInput.GetAction("statsBtn", EActionEvent.Down))
        {
            GyUtils.Instance.ShowOrHidePanel("CharStatPanel");
            return;
        }
        if (TCKInput.GetAction("hpBtn", EActionEvent.Down))
        {
            UseItem();
            return;
        }

#else
        if (Input.GetKeyDown(KeyCode.LeftControl))
        {
            PlayAttackMotion();
            return;
        }
        if (Input.GetKeyUp(KeyCode.LeftControl))
        {
            OnPlayCompletedEvents.AddListener(() => {
                if (!IsAttacking)
                {
                    return;
                }
                IsAttacking = false;
                OnPlayStartEvents.RemoveAllListeners();
                OnPlayCompletedEvents.RemoveAllListeners();
                //[延迟调用可以解决因延迟问题导致的动作切换为站立时坐标不正确的问题]
                GyUtils.Instance.StartDelayExecute(() => characterController2D.OnLandEvent.Invoke());
            });
            return;
        }
        if (Input.GetKeyDown(KeyCode.Z))
        {
            PickUp();
            return;
        }
        if (Input.GetKeyDown(KeyCode.E))
        {
            GyUtils.Instance.ShowOrHidePanel("CharEquippedPanel");
            return;
        }
        if (Input.GetKeyDown(KeyCode.I))
        {
            GyUtils.Instance.ShowOrHidePanel("CharItemsPanel");
            return;
        }
        if (Input.GetKeyDown(KeyCode.S))
        {
            GyUtils.Instance.ShowOrHidePanel("CharStatPanel");
            return;
        }
        if (Input.GetKeyDown(KeyCode.End))
        {
            UseItem();
            return;
        }
#endif
    }

    private void UseItem() {
        var itemId = 2000000;
        CharacterBean characterBean = GyUtils.Instance.FindMyPlayerData();
        if (null == characterBean)
        {
            return;
        }

        ItemConsumeBean consumeBean = null;
        foreach (var item in characterBean.itemConsumeList)
        {
            if (item.itemId == itemId)
            {
                consumeBean = item;
            }
        }
        if (null == consumeBean)
        {
            GyUtils.Instance.AddChatBoxMessage("没有药水了", new Color(1F, 1F, 0F));
            return;
        }
        GyUtils.Instance.UseItem(itemId, consumeBean.position);
    }

    private void PickUp()
    {
        if (characterBean.characterStatsBean.hp <= 0)
        {
            return;
        }
        //[获取角色当前位置的]
        Collider2D collider = Physics2D.OverlapCircle(transform.position, 2F, LayerMask.GetMask("DropItem"));
        if (null == collider)
        {
            return;
        }
        //[发送捡取数据到服务端]
        DropDataBean dropDataBean = collider.GetComponent<DropDataBean>();
        var dos = new DataOutputStream();
        dos.WriteShort(ChannelCommandConstants.PICK_UP);
        dos.WriteUTF(dropDataBean.unique);
        WebSocketChannelClient.Ws.Send(dos.ToByteArray());
    }

    public void PlayAttackMotion()
    {
        //[角色死亡不执行]
        if (characterBean.characterStatsBean.hp <= 0)
        {
            return;
        }
        //[如果正在攻击则不执行]
        if (IsAttacking)
        {
            return;
        }
        //[如果正在移动则不允许攻击]
        if (characterController2D.IsWalking)
        {
            return;
        }
        //[如果正在梯绳上时则不允许攻击]
        if (characterController2D.IsOnLadderRope)
        {
            return;
        }
        if (-1 == weapon || -1 == attackId)
        {
            GyUtils.Instance.AlertError("没有武器无法攻击");
            return;
        }
        //[每次开始播放动画时播放音效]
        OnPlayStartEvents.AddListener(() => GyUtils.Instance.PlayHttpAudio($"Weapon/{sfx}.Attack"));
        IsAttacking = true;
        //[改变动画]
        var actions = attackTypes[attackId];
        string[] actionNames = actions[0];
        var rand = Random.Range(0, actionNames.Length);
        var actionName = actionNames[rand];
        ChangeMotion(actionName);
    }

    private bool IsAttackMotion()
    {
        foreach (var items in attackTypes.Values)
        {
            foreach (var item in items)
            {
                foreach (var s in item)
                {
                    if (s == characterMotion)
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private void ShowWeaponLightEffect()
    {
        if (!IsAttackMotion())
        {
            return;
        }
        GameObject imageNode = GyUtils.Instance.LoadImageNode(actionOffset.transform.Find("Body"));
        imageNode.name = "WeaponLightEffect";
        imageNode.tag = "WeaponLightEffect";
        imageNode.layer = LayerMask.NameToLayer("WeaponLightEffect");
        GyUtils.Instance.GetJSON($"/Character/Afterimage/{afterImage}.img.xml", root =>
        {
            string weaponStr = weapon.ToString().PadLeft(8, '0');
            GyUtils.Instance.GetJSON($"/Character/Weapon/{weaponStr}.img.xml", weaponRoot =>
            {
                var weaponInfo = weaponRoot["info"];
                int reqLevel = weaponInfo["reqLevel"];
                //[武器需求等级]
                int levelIndex = reqLevel / 100;
                JSONObject motionNode = root[levelIndex.ToString()][characterMotion];
                if (null == motionNode)
                {
                    return;
                }
                string num = motionNode.keys[0];
                Vector2 lt = motionNode["lt"];
                Vector2 rb = motionNode["rb"];
                Vector2 attackRange = rb - lt;
                attackRange.x = Mathf.Abs(attackRange.x);
                attackRange.y = Mathf.Abs(attackRange.y);
                List<JSONObject> animates = motionNode[num].list;
                ShowWeaponLightEffect1(imageNode, levelIndex, num, animates, 0, attackRange);

            });
        });
    }

    private void ShowWeaponLightEffect1(GameObject imageNode, int levelIndex, string num, List<JSONObject> animates, byte aniIndex, Vector2 attackRange)
    {
        JSONObject animate = animates[aniIndex];
        Vector2 origin = animate["origin"];
        float delay = animate["delay"];
        var a1 = animate["a1"];
        delay /= 1000;
        //[光效坐标 = 光效原点 - 身体原点]
        var pos = origin - bodyOrigin;
        pos.x = -pos.x;
        RectTransform rectTransform = imageNode.transform as RectTransform;
        rectTransform.anchoredPosition = pos;
        var motion = characterMotion;
        GyUtils.Instance.StartDelayExecute(() =>
        {
            if (null == imageNode)
            {
                return;
            }
            GyUtils.Instance.GetImage($"/Character/Afterimage/{afterImage}/{levelIndex}.{motion}.{num}.{aniIndex}.png", sprite =>
            {
                if (null == imageNode)
                {
                    return;
                }
                imageNode.transform.SetAsLastSibling();
                Image image = imageNode.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();
                if (null != a1)
                {
                    GyUtils.Instance.Transition(time =>
                    {
                        if (null == imageNode)
                        {
                            return;
                        }
                        Image image = imageNode.GetComponent<Image>();
                        Color color = image.color;
                        color.a = Mathf.Lerp(1F, a1 / 255F, time);
                        image.color = color;
                    }, delay);
                }

                if (++aniIndex < animates.Count)
                {
                    ShowWeaponLightEffect1(imageNode, levelIndex, num, animates, aniIndex, attackRange);
                }
                else if (name == GlobalCache.SelectedCharacterUid)
                {
                    //[添加触发器]
                    BoxCollider2D boxCollider2D = imageNode.AddComponent<BoxCollider2D>();
                    boxCollider2D.size = attackRange;
                    boxCollider2D.offset = new Vector2(attackRange.x / 2, -attackRange.y);
                    boxCollider2D.isTrigger = true;
                    GyUtils.Instance.StartDelayExecute(() => Destroy(imageNode), 2F);
                }
            });
        }, delay);
    }

    /// <summary>
    /// [改变角色动作]
    /// </summary>
    /// <param name="newMotion">[新动作名称]</param>
    public void ChangeMotion(string newMotion, bool isPlayOneTime = false)
    {
        if (characterBean.characterStatsBean.hp <= 0)
        {
            newMotion = CharacterMotionConstants.DEAD;
        }
        characterMotion = newMotion;
        this.isPlayOneTime = isPlayOneTime;
        ReloadAll();
        if (name != GlobalCache.SelectedCharacterUid)
        {
            return;
        }
        if (null == playerMove)
        {
            return;
        }
        playerMove.PlayerMoveSynchronization();
        switch (newMotion)
        {
            //case CharacterMotionConstants.STAND:
            //case CharacterMotionConstants.WALK:
            case CharacterMotionConstants.JUMP:
                return;
            default:
                break;
        }
        var dos = new DataOutputStream();
        dos.WriteShort(ChannelCommandConstants.CHANGE_MOTION);
        dos.WriteUTF(newMotion);
        dos.WriteInt((int)rt.anchoredPosition.x);
        dos.WriteInt((int)rt.anchoredPosition.y);
        WebSocketChannelClient.Ws.Send(dos.ToByteArray());
    }

    public void ReloadAll() {
        IsPauseMotionAnimate = false;
        isPlayOneTime = false;
        GyUtils.Instance.StopCoroutine(playingActionAnimate);
        motionIndex = 0;
        Destroy(actionOffset);
        LoadAll();
    }

    private void LoadAll()
    {
        if (-1 == weapon)
        {
            switch (characterMotion)
            {
                case CharacterMotionConstants.STAND:
                    motion = "stand1";
                    break;
                case CharacterMotionConstants.WALK:
                    motion = "walk1";
                    break;
                case CharacterMotionConstants.JUMP:
                case CharacterMotionConstants.DEAD:
                default:
                    motion = characterMotion;
                    break;
            }
            standId = -1;
            walkId = -1;
            attackId = -1;
            afterImage = null;
            sfx = null;
            LoadHead();
            return;
        }
        string weaponStr = weapon.ToString().PadLeft(8, '0');
        GyUtils.Instance.GetJSON($"/Character/Weapon/{weaponStr}.img.xml", weaponRoot =>
        {
            JSONObject weaponInfo = weaponRoot["info"];
            standId = weaponInfo["stand"];
            walkId = weaponInfo["walk"];
            attackId = weaponInfo["attack"];
            afterImage = weaponInfo["afterImage"];
            sfx = weaponInfo["sfx"];

            switch (characterMotion)
            {
                case CharacterMotionConstants.STAND:
                    motion = characterMotion + standId;
                    break;
                case CharacterMotionConstants.WALK:
                    motion = characterMotion + walkId;
                    break;
                case CharacterMotionConstants.JUMP:
                default:
                    motion = characterMotion;
                    break;
            }
            LoadHead();
        });
    }

    private void LoadHead()
    {
        string headStr = head.ToString().PadLeft(8, '0');
        actionOffset = GyUtils.Instance.LoadNode(transform.gameObject, "ActionOffset");
        actionOffset.transform.SetAsFirstSibling();
        var characterController2D = GetComponent<CharacterController2D>();
        if (null == characterController2D || characterController2D.IsFacingRight)
        {
            FaceToRight();
        }
        GameObject imgObj = GyUtils.Instance.LoadImageNode(actionOffset, "Head");

        var motion = this.motion == CharacterMotionConstants.DEAD ? "stand1" : this.motion;
        var motionIndex = this.motionIndex;

        GyUtils.Instance.GetJSON($"/Character/{headStr}.img.xml", headRoot => {
            GyUtils.Instance.GetImage($"/Character/{headStr}/{motion}.{motionIndex}.head.png", sprite => {
                if (null == imgObj)
                {
                    return;
                }
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                var headNode = headRoot[motion][motionIndex.ToString()]["head"];
                headNode = GetRealNode(headRoot, headNode, motion);
                Vector2 headOrigin = headNode["origin"];

                //[渲染脸型]
                LoadFace(imgObj, headRoot, headOrigin);
                //[渲染发型1]
                var hair1 = LoadHair_1(imgObj, headRoot, headOrigin);
                //[渲染发型2]
                var hair2 = LoadHair_2(imgObj, headRoot, headOrigin);
                //[渲染帽子]
                LoadCap(imgObj, headRoot, headOrigin, hair1, hair2);
                //[渲染身体]
                LoadBody(actionOffset, headRoot, headOrigin);
            });
        });
    }

    private void LoadBody(GameObject parent, JSONObject headRoot, Vector2 headOrigin)
    {
        string bodyStr = body.ToString().PadLeft(8, '0');
        GameObject imgObj = GyUtils.Instance.LoadImageNode(parent, "Body");

        GyUtils.Instance.GetJSON($"/Character/{bodyStr}.img.xml", bodyRoot =>
        {
            PlayBodyAnimate(headRoot, headOrigin, bodyRoot, bodyStr, imgObj);
        });
    }

    private void PlayBodyAnimate(JSONObject headRoot, Vector2 headOrigin, JSONObject bodyRoot, string bodyStr, GameObject bodyPanel)
    {
        //[对象销毁时停止动画播放]
        if (null == bodyPanel)
        {
            return;
        }
        var motionNode = bodyRoot[motion];
        var motionCount = motionNode.Count;
        if (motionIndex >= motionCount)
        {
            OnPlayCompletedEvents.Invoke();
            if (isPlayOneTime)
            {
                return;
            }
            motionIndex = 0;
        }
        if (0 == motionIndex)
        {
            OnPlayStartEvents.Invoke();
        }
        if (1 == motionIndex)
        {
            //[出现武器光效]
            ShowWeaponLightEffect();
        }
        JSONObject singleMotion = motionNode[motionIndex.ToString()];
        JSONObject d = singleMotion["delay"];
        float delay = null == d ? .1F : d;
        delay /= 1000;
        var bodyNode = singleMotion["body"];
        var armNode = singleMotion["arm"];
        //armNode = GetRealNode(bodyRoot, armNode, motion);

        if (IsPauseMotionAnimate)
        {
            //playingActionAnimate = GyUtils.Instance.StartDelayExecute(() =>
            //{
            //    PlayBodyAnimate(headRoot, headOrigin, bodyRoot, bodyStr, bodyPanel);
            //}, delay);
            return;
        }

        GyUtils.Instance.GetImage($"/Character/{bodyStr}/{motion}.{motionIndex}.body.png", sprite =>
        {
            if (null == bodyPanel)
            {
                return;
            }
            Image image = bodyPanel.GetComponent<Image>();
            image.sprite = sprite;
            image.SetNativeSize();
            var characterController2D = GetComponent<CharacterController2D>();
            if (null != characterController2D && characterController2D.IsOnLadderRope)
            {
                bodyPanel.transform.SetAsFirstSibling();
            }

            bodyOrigin = bodyNode["origin"];
            RectTransform rectTransform = bodyPanel.transform as RectTransform;

            var motion = this.motion == CharacterMotionConstants.DEAD ? "stand1" : this.motion;
            JSONObject headNode = headRoot[motion][motionIndex.ToString()]["head"];
            headNode = GetRealNode(headRoot, headNode, motion);
            Vector2 headNeck = headNode["map"]["neck"];
            Vector2 bodyNeck = bodyNode["map"]["neck"];
            var pos = (headOrigin + headNeck) - (bodyOrigin + bodyNeck);
            var centerBottom = -pos - bodyOrigin;
            centerBottom.y = -centerBottom.y;
            pos.y = -pos.y;
            rectTransform.anchoredPosition = pos;

            //Vector2 bodyNavel = bodyNode["map"]["navel"];
            //bodyNavel.y = -bodyNavel.y;
            ////[肚脐]
            //var centerBottom = bodyNavel - pos;
            ////[肚脐偏移到底部中心]
            //centerBottom += new Vector2(-5F, 10F);

            centerBottom.x *= 2;
            centerBottom.x = Mathf.Abs(centerBottom.x);
            centerBottom.y = Mathf.Abs(centerBottom.y);
            (actionOffset.transform as RectTransform).sizeDelta = centerBottom;
            (actionOffset.transform as RectTransform).pivot = new Vector2(0.5F, 0F);
            Destroy(actionOffset.GetComponent<Image>());
            //(actionOffset.transform as RectTransform).anchoredPosition = new Vector2(-20, 64);
            //(actionOffset.transform as RectTransform).sizeDelta = centerBottom;
            //actionOffset.transform.Translate(-20, 64, 0);

            if (CharacterMotionConstants.DEAD == characterMotion)
            {
                return;
            }

            //[渲染鞋子]
            LoadShoes(bodyPanel, bodyRoot, bodyOrigin);
            //[渲染裤子]
            LoadPants(bodyPanel, bodyRoot, bodyOrigin);
            //[渲染上衣]
            LoadCoat(bodyPanel, bodyRoot, bodyOrigin);
            //[渲染手臂]
            if (null != armNode)
            {
                Vector2 armOrigin = armNode["origin"];
                LoadArm(bodyPanel, bodyRoot, bodyOrigin, armOrigin);
            }
        });

        playingActionAnimate = GyUtils.Instance.StartDelayExecute(() =>
        {
            motionIndex++;
            PlayBodyAnimate(headRoot, headOrigin, bodyRoot, bodyStr, bodyPanel);
        }, delay);

    }

    /// <summary>
    /// [将角色面向左边]
    /// </summary>
    public void FaceToLeft()
    {
        actionOffset.transform.localRotation = Quaternion.Euler(0, 0, 0);
    }

    /// <summary>
    /// [将角色面向右边]
    /// </summary>
    public void FaceToRight()
    {
        actionOffset.transform.localRotation = Quaternion.Euler(0, 180, 0);
    }

    /// <summary>
    /// [角色是否面向右边]
    /// </summary>
    /// <returns></returns>
    public bool IsFacingRight()
    {
        return actionOffset.transform.localRotation.y > 0F;
    }

    private void LoadArm(GameObject parent, JSONObject bodyRoot, Vector2 bodyOrigin, Vector2 armOrigin)
    {
        string bodyStr = body.ToString().PadLeft(8, '0');
        Transform parentTransform = parent.transform.Find("Arm");
        GameObject armObj = null != parentTransform ? parentTransform.gameObject : GyUtils.Instance.LoadNode(parent, "Arm");

        GyUtils.Instance.GetImage($"/Character/{bodyStr}/{motion}.{motionIndex}.arm.png", sprite => {
            if (null == armObj)
            {
                return;
            }
            //[渲染武器]
            LoadWeapon(armObj, bodyRoot, armOrigin);

            Transform parentTransform = armObj.transform.Find("ArmImage");
            GameObject armImage = null != parentTransform ? parentTransform.gameObject : GyUtils.Instance.LoadImageNode(armObj, "ArmImage");
            Image image = armImage.GetComponent<Image>();
            image.sprite = sprite;
            image.SetNativeSize();

            var bodyNode = bodyRoot[motion][motionIndex.ToString()]["body"];
            var armNode = bodyRoot[motion][motionIndex.ToString()]["arm"];
            RectTransform rectTransform = armObj.transform as RectTransform;

            Vector2 bodyNavel = bodyNode["map"]["navel"];
            Vector2 armNavel = armNode["map"]["navel"];
            var pos = (bodyOrigin + bodyNavel) - (armOrigin + armNavel);
            pos.y = -pos.y;
            rectTransform.anchoredPosition = pos;
            //[渲染上衣手臂]
            LoadCoatArm(parent, bodyRoot, bodyOrigin);
        });
    }

    private void LoadCoatArm(GameObject parent, JSONObject bodyRoot, Vector2 bodyOrigin)
    {
        if (-1 == coat)
        {
            return;
        }
        string coatStr = coat.ToString().PadLeft(8, '0');

        var motion = this.motion;
        var motionIndex = this.motionIndex;

        GyUtils.Instance.GetJSON($"/Character/Coat/{coatStr}.img.xml", coatRoot => {
            var nodeName = "mailArm";
            var coatNode = coatRoot[motion][motionIndex.ToString()][nodeName];
            if (null == coatNode)
            {
                return;
            }
            string realImageName = GetRealImageName(coatNode, motion, nodeName);
            coatNode = GetRealNode(coatRoot, coatNode, motion);
            Transform parentTransform = parent.transform.Find("CoatArm");
            GameObject imgObj = null != parentTransform ? parentTransform.gameObject : GyUtils.Instance.LoadImageNode(parent, "CoatArm");
            GyUtils.Instance.GetImage($"/Character/Coat/{coatStr}/{realImageName}.png", sprite => {
                if (null == imgObj)
                {
                    return;
                }
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                Vector2 coatOrigin = coatNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                Vector2 bodyNavel = bodyRoot[motion][motionIndex.ToString()]["body"]["map"]["navel"];
                Vector2 coatNavel = coatNode["map"]["navel"];
                var pos = (bodyOrigin + bodyNavel) - (coatOrigin + coatNavel);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
    }

    private void LoadWeapon(GameObject parent, JSONObject bodyRoot, Vector2 armOrigin)
    {
        if (-1 == weapon)
        {
            return;
        }
        if (null == parent)
        {
            return;
        }
        string weaponStr = weapon.ToString().PadLeft(8, '0');

        var motion = this.motion;
        var motionIndex = this.motionIndex;

        Transform parentTransform = parent.transform.Find("Weapon");
        GameObject imgObj = null != parentTransform ? parentTransform.gameObject : GyUtils.Instance.LoadImageNode(parent, "Weapon");

        GyUtils.Instance.GetJSON($"/Character/Weapon/{weaponStr}.img.xml", weaponRoot => {
            var nodeName = "weapon";
            JSONObject weaponMotion = weaponRoot[motion];
            JSONObject singleNode = weaponMotion[motionIndex.ToString()];
            var weaponNode = singleNode[nodeName];
            string realImageName = GetRealImageName(weaponNode, motion, nodeName);
            weaponNode = GetRealNode(weaponRoot, weaponNode, motion);
            GyUtils.Instance.GetImage($"/Character/Weapon/{weaponStr}/{realImageName}.png", sprite =>
            {
                if (null == imgObj)
                {
                    return;
                }
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                Vector2 weaponOrigin = weaponNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                string z = weaponNode["z"];
                if ("weaponBelowBody" == z)
                {
                    rectTransform.parent.SetAsFirstSibling();
                }
                else
                {
                    rectTransform.parent.SetAsLastSibling();
                }

                JSONObject armNode = bodyRoot[motion][motionIndex.ToString()]["arm"];

                z = armNode["z"];
                if ("armBelowHead" == z)
                {
                    rectTransform.parent.parent.SetAsLastSibling();
                }
                else
                {
                    rectTransform.parent.parent.SetAsFirstSibling();
                }

                JSONObject armMap = armNode["map"];
                var weaponMap = weaponNode["map"];
                Vector2 armHand, weaponHand;
                var wHand = weaponMap["hand"];
                if (null != wHand)
                {
                    armHand = armMap["hand"];
                    weaponHand = wHand;
                }
                else
                {
                    armHand = armMap["navel"];
                    weaponHand = weaponMap["navel"]; ;
                }
                var pos = (armOrigin + armHand) - (weaponOrigin + weaponHand);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
    }

    private void LoadShoes(GameObject parent, JSONObject bodyRoot, Vector2 bodyOrigin)
    {
        if (-1 == shoes)
        {
            return;
        }
        string shoesStr = shoes.ToString().PadLeft(8, '0');

        Transform parentTransform = parent.transform.Find("Shoes");
        GameObject imgObj = null != parentTransform ? parentTransform.gameObject : GyUtils.Instance.LoadImageNode(parent, "Shoes");

        GyUtils.Instance.GetJSON($"/Character/Shoes/{shoesStr}.img.xml", shoesRoot => {
            var nodeName = "shoes";
            var shoesNode = shoesRoot[motion][motionIndex.ToString()][nodeName];
            string realImageName = GetRealImageName(shoesNode, motion, nodeName);
            shoesNode = GetRealNode(shoesRoot, shoesNode, motion);
            GyUtils.Instance.GetImage($"/Character/Shoes/{shoesStr}/{realImageName}.png", sprite => {
                if (null == imgObj)
                {
                    return;
                }
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                Vector2 shoesOrigin = shoesNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                Vector2 bodyNavel = bodyRoot[motion][motionIndex.ToString()]["body"]["map"]["navel"];
                Vector2 shoesNavel = shoesNode["map"]["navel"];
                var pos = (bodyOrigin + bodyNavel) - (shoesOrigin + shoesNavel);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
    }

    private void LoadPants(GameObject parent, JSONObject bodyRoot, Vector2 bodyOrigin)
    {
        if (-1 == pants)
        {
            return;
        }
        string pantsStr = pants.ToString().PadLeft(8, '0');

        Transform parentTransform = parent.transform.Find("Pants");
        GameObject imgObj = null != parentTransform ? parentTransform.gameObject : GyUtils.Instance.LoadImageNode(parent, "Pants");

        GyUtils.Instance.GetJSON($"/Character/Pants/{pantsStr}.img.xml", pantsRoot => {
            var nodeName = "pants";
            var pantsNode = pantsRoot[motion][motionIndex.ToString()][nodeName];
            string realImageName = GetRealImageName(pantsNode, motion, nodeName);
            pantsNode = GetRealNode(pantsRoot, pantsNode, motion);
            GyUtils.Instance.GetImage($"/Character/Pants/{pantsStr}/{realImageName}.png", sprite => {
                if (null == imgObj)
                {
                    return;
                }
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                Vector2 pantsOrigin = pantsNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                Vector2 bodyNavel = bodyRoot[motion][motionIndex.ToString()]["body"]["map"]["navel"];
                Vector2 pantsNavel = pantsNode["map"]["navel"];
                var pos = (bodyOrigin + bodyNavel) - (pantsOrigin + pantsNavel);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
    }

    private void LoadCoat(GameObject parent, JSONObject bodyRoot, Vector2 bodyOrigin)
    {
        if (-1 == coat)
        {
            return;
        }
        string coatStr = coat.ToString().PadLeft(8, '0');

        var motion = this.motion;
        var motionIndex = this.motionIndex;

        Transform parentTransform = parent.transform.Find("Coat");
        GameObject imgObj = null != parentTransform ? parentTransform.gameObject : GyUtils.Instance.LoadImageNode(parent, "Coat");

        GyUtils.Instance.GetJSON($"/Character/Coat/{coatStr}.img.xml", coatRoot => {

            var nodeName = "mail";
            var coatNode = coatRoot[motion][motionIndex.ToString()][nodeName];
            string realImageName = GetRealImageName(coatNode, motion, nodeName);
            coatNode = GetRealNode(coatRoot, coatNode, motion);

            GyUtils.Instance.GetImage($"/Character/Coat/{coatStr}/{realImageName}.png", sprite => {
                if (null == imgObj)
                {
                    return;
                }
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                Vector2 coatOrigin = coatNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                Vector2 bodyNavel = bodyRoot[motion][motionIndex.ToString()]["body"]["map"]["navel"];
                Vector2 coatNavel = coatNode["map"]["navel"];
                var pos = (bodyOrigin + bodyNavel) - (coatOrigin + coatNavel);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
    }

    private void LoadCap(GameObject parent, JSONObject headRoot, Vector2 headOrigin, RectTransform hair1, RectTransform hair2)
    {
        if (-1 == cap)
        {
            return;
        }
        string capStr = cap.ToString().PadLeft(8, '0');

        GameObject imgObj = GyUtils.Instance.LoadImageNode(parent, "Cap");

        var motion = this.motion == CharacterMotionConstants.DEAD ? "stand1" : this.motion;
        var motionIndex = this.motionIndex;

        GyUtils.Instance.GetJSON($"/Character/Cap/{capStr}.img.xml", capRoot => {
            var nodeName = "default";
            var capNode = capRoot[motion][motionIndex.ToString()][nodeName];
            //[下面代码上下顺序不能颠倒, GetRealImageName必须在hairNode改变之前使用]
            string realImageName = GetRealImageName(capNode, motion, nodeName);
            capNode = GetRealNode(capRoot, capNode, motion);

            string overType = capRoot["info"]["vslot"];
            switch (overType)
            {
                //[在头发最下面, 不遮住头发]
                case "CpH5":
                    imgObj.transform.SetSiblingIndex(hair1.GetSiblingIndex());
                    break;
                //[在头发中间, 遮住hair2]
                case "CpH1H5":
                    imgObj.transform.SetSiblingIndex(hair2.GetSiblingIndex());
                    Destroy(hair2.gameObject);
                    break;
                //[全部遮住头发, 不渲染hair1和hair2]
                default:
                    Destroy(hair1.gameObject);
                    Destroy(hair2.gameObject);
                    break;
            }

            GyUtils.Instance.GetImage($"/Character/Cap/{capStr}/{realImageName}.png", sprite => {
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                Vector2 capOrigin = capNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                JSONObject headNode = headRoot[motion][motionIndex.ToString()]["head"];
                headNode = GetRealNode(headRoot, headNode, motion);
                Vector2 headBrow = headNode["map"]["brow"];
                Vector2 capBrow = capNode["map"]["brow"];
                var pos = (headOrigin + headBrow) - (capOrigin + capBrow);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
    }

    private RectTransform LoadHair_1(GameObject parent, JSONObject headRoot, Vector2 headOrigin)
    {
        string hairStr = hair.ToString().PadLeft(8, '0');

        GameObject imgObj = GyUtils.Instance.LoadImageNode(parent, "Hair1");
        if (-1 == hair)
        {
            return imgObj.transform as RectTransform;
        }

        var motion = this.motion == CharacterMotionConstants.DEAD ? "stand1" : this.motion;
        var motionIndex = this.motionIndex;

        GyUtils.Instance.GetJSON($"/Character/Hair/{hairStr}.img.xml", hairRoot => {
            var nodeName = "hair";
            var hairNode = hairRoot[motion][motionIndex.ToString()][nodeName];
            if (null == hairNode)
            {
                nodeName = "backHair";
                hairNode = hairRoot[motion][motionIndex.ToString()][nodeName];
            }
            if (null == hairNode)
            {
                return;
            }
            //[下面代码上下顺序不能颠倒, GetRealImageName必须在hairNode改变之前使用]
            string realImageName = GetRealImageName(hairNode, motion, nodeName);
            hairNode = GetRealNode(hairRoot, hairNode, motion);

            GyUtils.Instance.GetImage($"/Character/Hair/{hairStr}/{realImageName}.png", sprite => {
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                Vector2 hairOrigin = hairNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                JSONObject headNode = headRoot[motion][motionIndex.ToString()]["head"];
                headNode = GetRealNode(headRoot, headNode, motion);
                Vector2 headBrow = headNode["map"]["brow"];
                Vector2 hairBrow = hairNode["map"]["brow"];
                var pos = (headOrigin + headBrow) - (hairOrigin + hairBrow);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
        return imgObj.transform as RectTransform;
    }

    private RectTransform LoadHair_2(GameObject parent, JSONObject headRoot, Vector2 headOrigin)
    {
        string hairStr = hair.ToString().PadLeft(8, '0');

        GameObject imgObj = GyUtils.Instance.LoadImageNode(parent, "Hair2");
        if (-1 == hair)
        {
            return imgObj.transform as RectTransform;
        }

        var motion = this.motion == CharacterMotionConstants.DEAD ? "stand1" : this.motion;
        var motionIndex = this.motionIndex;

        GyUtils.Instance.GetJSON($"/Character/Hair/{hairStr}.img.xml", hairRoot => {
            var nodeName = "hairOverHead";
            var hairNode = hairRoot[motion][motionIndex.ToString()][nodeName];
            if (null == hairNode)
            {
                nodeName = "backHairBelowCapNarrow";
                hairNode = hairRoot[motion][motionIndex.ToString()][nodeName];
            }
            if (null == hairNode)
            {
                nodeName = "backHairBelowCap";
                hairNode = hairRoot[motion][motionIndex.ToString()][nodeName];
            }
            if (null == hairNode)
            {
                return;
            }
            string realImageName = GetRealImageName(hairNode, motion, nodeName);
            hairNode = GetRealNode(hairRoot, hairNode, motion);

            GyUtils.Instance.GetImage($"/Character/Hair/{hairStr}/{realImageName}.png", sprite => {
                if (null == imgObj)
                {
                    return;
                }
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                hairNode = GetRealNode(hairRoot, hairNode, motion);
                Vector2 hairOrigin = hairNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                JSONObject headNode = headRoot[motion][motionIndex.ToString()]["head"];
                headNode = GetRealNode(headRoot, headNode, motion);
                Vector2 headBrow = headNode["map"]["brow"];
                Vector2 hairBrow = hairNode["map"]["brow"];
                var pos = (headOrigin + headBrow) - (hairOrigin + hairBrow);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
        return imgObj.transform as RectTransform;
    }

    private void LoadFace(GameObject parent, JSONObject headRoot, Vector2 headOrigin)
    {
        string faceStr = face.ToString().PadLeft(8, '0');

        GameObject imgObj = GyUtils.Instance.LoadImageNode(parent, "Face");
        if (-1 == face)
        {
            return;
        }

        var motion = this.motion == CharacterMotionConstants.DEAD ? "stand1" : this.motion;
        var motionIndex = this.motionIndex;

        GyUtils.Instance.GetJSON($"/Character/Face/{faceStr}.img.xml", faceRoot => {
            GyUtils.Instance.GetImage($"/Character/Face/{faceStr}/default.face.png", sprite => {
                Image image = imgObj.GetComponent<Image>();
                image.sprite = sprite;
                image.SetNativeSize();

                var faceNode = faceRoot["default"]["face"];
                faceNode = GetRealNode(faceRoot, faceNode, motion);
                Vector2 faceOrigin = faceNode["origin"];
                RectTransform rectTransform = imgObj.transform as RectTransform;

                JSONObject headNode = headRoot[motion][motionIndex.ToString()]["head"];
                headNode = GetRealNode(headRoot, headNode, motion);
                Vector2 headBrow = headNode["map"]["brow"];
                Vector2 faceBrow = faceNode["map"]["brow"];
                var pos = (headOrigin + headBrow) - (faceOrigin + faceBrow);
                pos.y = -pos.y;
                rectTransform.anchoredPosition = pos;
            });
        });
    }

    /// <summary>
    /// [如果当前节点是引用则解析引用并返回真实的数据]
    /// </summary>
    /// <param name="root">[根节点]</param>
    /// <param name="currentNode">[当前节点]</param>
    /// <returns>[真实的数据]</returns>
    private JSONObject GetRealNode(JSONObject root, JSONObject currentNode, string motion)
    {
        if (!currentNode.IsString)
        {
            return currentNode;
        }

        string nodeStr = currentNode;
        if (nodeStr.StartsWith("../../"))
        {
            currentNode = root;
            string[] nodeNames = nodeStr.Split('/');
            foreach (var nodeName in nodeNames)
            {
                if ("..".Equals(nodeName))
                {
                    continue;
                }
                currentNode = currentNode[nodeName];
            }
            return currentNode;
        }

        if (nodeStr.StartsWith("../"))
        {
            currentNode = root[motion];
            string[] nodeNames = nodeStr.Split('/');
            foreach (var nodeName in nodeNames)
            {
                if ("..".Equals(nodeName))
                {
                    continue;
                }
                currentNode = currentNode[nodeName];
            }
            return currentNode;
        }

        return currentNode;
    }

    /// <summary>
    /// [如果当前节点是引用则解析引用并返回真实的数据]
    /// </summary>
    /// <param name="currentNode">[当前节点]</param>
    /// <returns>[真实的数据]</returns>
    private string GetRealImageName(JSONObject currentNode, string motion, string nodeName)
    {
        if (!currentNode.IsString)
        {
            return $"{motion}.{motionIndex}.{nodeName}";
        }

        string nodeStr = currentNode;
        if (nodeStr.StartsWith("../../"))
        {
            return nodeStr.Replace("../", "").Replace("/", ".");
        }

        if (nodeStr.StartsWith("../"))
        {
            return $"{motion}.{nodeStr.Replace("../", "").Replace("/", ".")}";
        }
        return currentNode;
    }
}
