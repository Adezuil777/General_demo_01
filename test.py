import random


def get_choice(prompt, options):
    while True:
        value = input(prompt).strip().lower()
        if value in options:
            return value
        print(f"请输入以下选项之一: {', '.join(sorted(options))}")


def create_state(name):
    return {"name": name, "affection": 0, "money": 100, "deaths": 0}


def show_status(state):
    print(f"\n当前状态 —— 好感度: {state['affection']} | 资产: {state['money']}G | 死亡次数: {state['deaths']}")


def intro():
    print("你睁开眼睛，发现自己躺在异世界王都的水边。")
    print("记忆有些混乱，只记得在原来的世界平凡地活着，然后——一阵刺痛与黑暗。")
    name = input("\n想起自己的名字是？\n> ").strip()
    if not name:
        name = "无名之人"
    print(f"\n{name}，欢迎来到这个充满魔法与阴谋的世界。")
    print("你很快遇到了一位银发少女，你的命运似乎从她开始产生波澜。")
    return name


def scene_market(state):
    print("\n【场景一：杂货店前的邂逅】")
    print("傍晚的集市熙熙攘攘，你看到银发少女在寻找被盗的徽章。")
    print("不远处几个可疑人物正朝巷子里走去。")
    choice = get_choice(
        "\n你打算怎么做？\n"
        "[1] 立刻追上去帮她夺回徽章\n"
        "[2] 提醒少女小心，但先观察情况\n"
        "[3] 装作没看见，先去逛摊子\n> ",
        {"1", "2", "3"},
    )
    if choice == "1":
        print("\n你冲进小巷，与小偷发生了冲突。")
        outcome = random.randint(0, 2)
        if outcome == 0:
            print("小偷掏出匕首，你一时大意，被致命一击。视线逐渐暗下……")
            return "dead", state
        print("你冒着受伤的风险夺回了徽章，自己也擦破了点皮。")
        state["affection"] += 3
        state["money"] -= 10
        if state["money"] < 0:
            state["money"] = 0
        print("银发少女向你深深鞠躬表示感谢。")
        return "inn", state
    if choice == "2":
        print("\n你保持距离跟在后方，悄悄观察。")
        print("发现小偷只是小混混，很快被城镇守卫驱散。")
        print("你帮少女分析事情经过，她对你的冷静很有好感。")
        state["affection"] += 2
        return "inn", state
    print("\n你假装没看见，转身走向摊位。")
    print("你买了几样小吃，心情不错，但隐约有种错过什么的感觉。")
    state["money"] -= 5
    if state["money"] < 0:
        state["money"] = 0
    state["affection"] -= 1
    return "inn", state


def scene_inn(state):
    print("\n【场景二：夜晚的旅店】")
    print("你在旅店过夜，银发少女也在同一家旅店休息。")
    print("半夜，你隐约听到走廊传来轻微的脚步声。")
    choice = get_choice(
        "\n你会怎么做？\n"
        "[1] 立刻冲出去查看情况\n"
        "[2] 先从门缝观察，再决定\n"
        "[3] 装作没听见，继续睡觉\n> ",
        {"1", "2", "3"},
    )
    if choice == "1":
        print("\n你猛地拉开门，刚好撞见一名戴兜帽的刺客。")
        print("对方比你想象中要快得多，一道寒光划过——")
        return "dead", state
    if choice == "2":
        print("\n你蹲在门后，从门缝观察。")
        print("看到刺客正悄悄靠近银发少女的房门。")
        print("你立刻敲响她房门，并大喊有危险，惊动了整层客人。")
        state["affection"] += 3
        state["money"] -= 10
        if state["money"] < 0:
            state["money"] = 0
        print("刺客被守卫制服，少女对你充满信任。")
        return "mansion", state
    print("\n你翻了个身，告诉自己这只是风声。")
    print("第二天清晨，旅店传来不好的消息：有人在夜里遇袭。")
    state["affection"] -= 2
    if state["affection"] < -5:
        print("你意识到自己的懦弱让你失去了重要的人。愧疚感压得你喘不过气。")
    return "mansion", state


def scene_mansion(state):
    print("\n【场景三：宅邸中的选择】")
    print("因为之前的相遇，你被邀请到一座贵族宅邸暂住。")
    print("这里看似安全，却暗藏权力斗争与阴谋。")
    choice = get_choice(
        "\n晚宴前，你打算？\n"
        "[1] 认真学习礼仪，尽量不给女主丢脸\n"
        "[2] 打探情报，寻找幕后黑手的蛛丝马迹\n"
        "[3] 在庭院里偷懒放风，享受难得的安宁\n> ",
        {"1", "2", "3"},
    )
    if choice == "1":
        print("\n你跟着女仆努力学习礼仪，在晚宴上表现得体。")
        print("贵族们对你印象不错，少女也对你投来鼓励的目光。")
        state["affection"] += 3
        state["money"] += 20
        return "end", state
    if choice == "2":
        print("\n你四处打听，偶然听到仆人们谈论某个危险的名字。")
        outcome = random.randint(0, 1)
        if outcome == 0:
            print("你被阴谋者发现，被引到偏僻走廊。")
            print("尚未来得及反应，一阵剧痛袭来，你再次失去了意识。")
            return "dead", state
        print("你获得了关于城中势力的关键信息，并提醒了少女注意。")
        state["affection"] += 4
        state["money"] += 10
        return "end", state
    print("\n你在庭院长椅上放空，仰望星空。")
    print("少女路过时看到这一幕，略带无奈地叹了口气，但还是坐在你旁边聊了一会。")
    state["affection"] += 1
    return "end", state


def scene_slums(state):
    print("\n【第二章：王都阴影】")
    print("白天的宅邸风平浪静，但夜晚的王都却在悄悄翻涌。")
    print("你听说最近贫民区有人失踪，似乎和某个危险势力有关。")
    choice = get_choice(
        "\n你来到贫民区的岔路口。\n"
        "[1] 追着线索深入巷子调查\n"
        "[2] 先安抚被欺负的孩子并给他们一些钱\n"
        "[3] 远远观察，打算改天再来\n> ",
        {"1", "2", "3"},
    )
    if choice == "1":
        print("\n你根据模糊的线索一路追踪，来到一扇半掩的地下门前。")
        outcome = random.randint(0, 2)
        if outcome == 0:
            print("门后有人早已埋伏，你刚推门就被重击倒地，世界再次归于黑暗。")
            return "dead", state
        print("你悄悄潜入，听到关于王都权力斗争的只言片语。")
        print("虽然险些被发现，但你还是安全撤离。")
        state["affection"] += 2
        state["money"] -= 15
        if state["money"] < 0:
            state["money"] = 0
        return "guild", state
    if choice == "2":
        print("\n你先将受伤的孩子带到安全的地方，并为他们买了食物。")
        print("孩子们向你打听那位银发小姐的情况，你意识到她在这里也被人记住了。")
        state["affection"] += 3
        state["money"] -= 20
        if state["money"] < 0:
            state["money"] = 0
        return "guild", state
    print("\n你选择暂时观望，没有立刻介入。")
    print("虽然避免了直接危险，但也错过了某些情报。")
    state["affection"] -= 1
    if state["affection"] < -10:
        state["affection"] = -10
    return "guild", state


def scene_guild(state):
    print("\n【第二章：旧城区冒险者公会】")
    print("你来到旧城区的冒险者公会，这里聚集着形形色色的人。")
    print("少女托你留意最近的失踪案件，希望你能活着回来。")
    choice = get_choice(
        "\n你打算接下哪种委托？\n"
        "[1] 高风险护送任务，报酬丰厚\n"
        "[2] 普通打工任务，稳妥但乏味\n"
        "[3] 帮女主收集与徽章相关的情报\n> ",
        {"1", "2", "3"},
    )
    if choice == "1":
        print("\n你带着临时队伍护送一批贵重货物前往城外。")
        outcome = random.randint(0, 2)
        if outcome == 0:
            print("伏击来得猝不及防，你被乱箭射中，倒在尘土之中。")
            return "dead", state
        if outcome == 1:
            print("一路惊险不断，但最终还是成功完成了任务。")
            state["money"] += 60
            state["affection"] += 1
            return "square", state
        print("你在危急时刻做出果断判断，避免了惨重伤亡。")
        print("事后，你的名字在公会的公告板上多了一行记录。")
        state["money"] += 80
        state["affection"] += 2
        return "square", state
    if choice == "2":
        print("\n你选择帮公会整理档案、搬运货物、照看仓库。")
        print("虽然没有惊险刺激，但换来了稳定的报酬与短暂的安心。")
        state["money"] += 30
        return "square", state
    print("\n你花时间查阅记录、询问来往的冒险者。")
    print("渐渐拼出了一个危险组织的轮廓，并将结果告诉了少女。")
    state["affection"] += 4
    state["money"] += 10
    return "square", state


def scene_square(state):
    print("\n【第二章：王城广场的预兆】")
    print("数日后，你和少女一同来到王城广场。")
    print("人群涌动，有人议论王选，有人低声谈论近期的不安气息。")
    choice = get_choice(
        "\n在广场上，你更多地关注？\n"
        "[1] 站在少女身边，为她挡住人群的冲撞\n"
        "[2] 四处穿梭，收集各路人马的情报\n"
        "[3] 远离中心，在边缘观察整个局势\n> ",
        {"1", "2", "3"},
    )
    if choice == "1":
        print("\n你牢牢守在少女身边，细心地替她挡开人群。")
        print("她抬头看向你，目光中多了几分信赖。")
        state["affection"] += 3
        return "end", state
    if choice == "2":
        print("\n你在人群中往来穿梭，记住了几张关键的面孔与阵营。")
        print("这些信息在未来的王选中也许能发挥巨大作用。")
        state["money"] += 20
        state["affection"] += 1
        return "end", state
    print("\n你选择站在高台边缘的位置，静静俯瞰整个广场。")
    print("在喧嚣之上，你隐约感觉到命运齿轮开始快速转动。")
    state["affection"] += 1
    return "end", state


def ending(state):
    show_status(state)
    print("\n【结局】")
    if state["affection"] >= 8 and state["money"] >= 80:
        print("你不仅守护了少女，也赢得了在这个世界安身立命的资本。")
        print("在一次次轮回与选择中，你们彼此成为对方最坚实的依靠。")
    elif state["affection"] >= 5:
        print("你在关键时刻做出了正确的选择。")
        print("尽管前路仍然危险，但至少此刻，你们并肩而立。")
    elif state["affection"] <= 0:
        print("你错过了太多机会，少女对你保持礼貌的距离。")
        print("你明白，若想改变这一切，或许还需要再一次“从零开始”。")
    else:
        print("你勉强在这个世界立足，却始终觉得哪里不够完美。")
        print("关于她的笑容，你还想再看到更多次。")


def main():
    name = intro()
    state = create_state(name)
    checkpoint_state = state.copy()
    current = "market"
    scenes_chapter1 = {
        "market": scene_market,
        "inn": scene_inn,
        "mansion": scene_mansion,
    }
    while True:
        show_status(state)
        scene_fn = scenes_chapter1[current]
        result, state = scene_fn(state)
        if result == "dead":
            state["deaths"] += 1
            print("\n一切归于黑暗，你的意识坠入深渊。")
            print("当你再次睁开眼睛，发现自己回到了上一重要选择之前。")
            state = checkpoint_state.copy()
            continue
        if result == "end":
            break
        checkpoint_state = state.copy()
        current = result
    print("\n第一章完结，你隐约意识到自己已经无法回到原来的日常。")
    checkpoint_state = state.copy()
    current = "slums"
    scenes_chapter2 = {
        "slums": scene_slums,
        "guild": scene_guild,
        "square": scene_square,
    }
    while True:
        show_status(state)
        scene_fn = scenes_chapter2[current]
        result, state = scene_fn(state)
        if result == "dead":
            state["deaths"] += 1
            print("\n一切归于黑暗，你的意识坠入深渊。")
            print("当你再次睁开眼睛，发现自己回到了上一重要选择之前。")
            state = checkpoint_state.copy()
            continue
        if result == "end":
            break
        checkpoint_state = state.copy()
        current = result
    ending(state)


if __name__ == "__main__":
    main()
