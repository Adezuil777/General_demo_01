import random


def intro():
    print("Welcome to Neo Era!")
    print("Civilization has advanced and the world needs heroes to shape its future.")
    print("Your mission: Navigate the challenges of this new age and become a legend.")


def choose_path():
    print("\nYou stand at the crossroads of destiny.")
    path = input("Choose your path: [1] Tech Innovator, [2] Urban Explorer, [3] Peacekeeper\n> ")
    return path


def tech_innovator():
    print("\nYou dive into a world of AI, robotics, and advancement.")
    task = input("Invent a device that solves a world problem (type your idea):\n> ")
    print(f"Your invention '{task}' catches the attention of the Neo Council!")
    if random.randint(0, 1):
        print("Congratulations! Your invention revolutionizes the city. You're now famous!")
    else:
        print("The Council decides your device needs more work. Keep innovating!")


def urban_explorer():
    print("\nYou set out to map the secrets of Neo City.")
    choice = input("Choose to explore: [a] Underground Labs, [b] Rooftop Gardens\n> ")
    if choice.lower() == 'a':
        print("You discover a hidden society of coders shaping the city's tech underground.")
    else:
        print("Amid lush gardens, you meet visionaries planting the future.")


def peacekeeper():
    print("\nYou strive to bring harmony to the city.")
    mission = input("Mediate a dispute between: [x] Rival Hackers, [y] Competing AI Bots\n> ")
    if mission.lower() == 'x':
        print("You broker peace, leading to a collaborative project benefiting all.")
    else:
        print("Your diplomacy convinces the AIs to merge, resulting in a breakthrough.")


def main():
    intro()
    path = choose_path()
    if path == '1':
        tech_innovator()
    elif path == '2':
        urban_explorer()
    elif path == '3':
        peacekeeper()
    else:
        print("Invalid option. Game over.")


main()
