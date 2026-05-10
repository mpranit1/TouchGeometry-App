import sys

with open(r'c:\pranit\project\src\screens\LessonScreen.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import GlobalStore from '../utils/GlobalStore';", "import GlobalStore from '../utils/GlobalStore';\nimport { CHAPTERS } from '../data/curriculum';")

start = content.find("const CHAPTERS = {")
end = content.find("const LessonScreen = ({ route, navigation }) => {")

if start != -1 and end != -1:
    content = content[:start] + content[end:]

with open(r'c:\pranit\project\src\screens\LessonScreen.js', 'w', encoding='utf-8') as f:
    f.write(content)
