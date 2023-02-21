import re
from bs4 import BeautifulSoup
import json
from pathlib import Path
from collections import deque
from shutil import rmtree
import os
from time import ctime

# 设置目标
root = Path(".")
# 不上传的文件
delete_target = [Path("Self"), Path("Study/Blockchain")]
# 文件后缀名(只支持html)
target_type = 'html'


# 扫描html文件
def scanhtml(path: Path, content) -> dict:
    htmlcontent = BeautifulSoup(content, 'html.parser')
    textlist = "".join(
        map(lambda p: re.sub(u"([^\u4e00-\u9fa5\u0030-\u0039\u0041-\u005a\u0061-\u007a])", "", p.get_text()),
            htmlcontent.find_all(name=['p', 'h2', 'h3', 'h4'])))

    tags = ",".join(map(lambda p: re.sub(u"([^\u4e00-\u9fa5\u0030-\u0039\u0041-\u005a\u0061-\u007a])", "", p.get_text()),
                        htmlcontent.find_all(class_='tag')))
    title = htmlcontent.find(class_="title")
    title = title.get_text() if title else path.stem
    return {
        "title": title,
        "path": path.relative_to(root).__str__(),
        "text": textlist,
        "tags": "".join(tags)
    }


# 上传到github
def git():
    print("=======push to github======")
    os.system("git add .")
    os.system(f'git commit -m "{ctime()}"')
    os.system("git push origin")


if __name__ == "__main__":
    j = []
    target = deque([root])
    print("=======scan folder=========")
    while len(target) > 0:
        file = target.pop()
        if file.is_dir():
            if file in delete_target:
                rmtree(file)
            else:
                target.extend(file.iterdir())
        elif file.is_file() and file.suffix == ".html":
            j.append(scanhtml(file, file.read_bytes()))

    print("====generate search page====")
    with open("searcher.js", "w") as output:
        with open("search.js", "r") as input:
            output.write("let SearchResult = '"+json.dumps(j)+"';\n")
            output.write(input.read())

    git()
