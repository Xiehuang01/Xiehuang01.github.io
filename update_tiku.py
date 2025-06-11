import json
import re

def main():
    # 读取题库JSON文件
    with open('ttiku.json', 'r', encoding='utf-8') as f:
        tiku_data = json.load(f)
    
    # 读取HTML文件
    with open('index.html', 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # 将题库数据转换为JavaScript代码
    tiku_js = json.dumps(tiku_data, ensure_ascii=False, indent=4)
    
    # 在HTML中查找并替换题库数据
    pattern = r'window\.questionData\s*=\s*\{[^}]*\};'
    replacement = f'window.questionData = {tiku_js};'
    
    new_html_content = re.sub(pattern, replacement, html_content)
    
    # 保存更新后的HTML文件
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html_content)
    
    print('题库数据已更新到index.html文件中')

if __name__ == '__main__':
    main() 