// 测试Ollama连接的脚本
const axios = require('axios');

async function testOllamaConnection() {
  const baseUrl = 'http://192.168.1.86:11434';
  
  console.log('🔍 测试Ollama服务连接...');
  console.log(`地址: ${baseUrl}`);
  console.log('----------------------------');
  
  try {
    // 1. 测试基本连接
    console.log('\n1️⃣ 测试基本连接...');
    const tagsResponse = await axios.get(`${baseUrl}/api/tags`);
    console.log('✅ 连接成功！');
    console.log('可用模型:', tagsResponse.data.models.map(m => m.name).join(', '));
    
    // 2. 测试聊天功能
    console.log('\n2️⃣ 测试聊天功能...');
    const chatResponse = await axios.post(`${baseUrl}/api/chat`, {
      model: 'qwen3:32b',
      messages: [
        { role: 'user', content: '说"测试成功"三个字' }
      ],
      stream: false
    });
    console.log('✅ 聊天API正常！');
    console.log('AI回复:', chatResponse.data.message.content);
    
    // 3. 测试流式响应
    console.log('\n3️⃣ 测试流式响应...');
    const streamResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen3:32b',
        messages: [{ role: 'user', content: '数到3' }],
        stream: true
      })
    });
    
    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            fullResponse += json.message.content;
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
    
    console.log('✅ 流式响应正常！');
    console.log('流式回复:', fullResponse);
    
    console.log('\n----------------------------');
    console.log('🎉 所有测试通过！Ollama服务运行正常。');
    console.log('\n📝 配置信息：');
    console.log('- Base URL: http://192.168.1.86');
    console.log('- Port: 11434');
    console.log('- Model: qwen3:32b');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

// 运行测试
testOllamaConnection();