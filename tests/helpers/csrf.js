function extractCsrfToken(html) {
    const metaMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
    if (metaMatch) return metaMatch[1];

    const formMatch = html.match(/name="_csrf"\s+value="([^"]+)"/);
    if (formMatch) return formMatch[1];

    throw new Error('CSRF token not found in response HTML');
}

async function fetchCsrfToken(agent, path = '/login') {
    const res = await agent.get(path);
    return extractCsrfToken(res.text);
}

function csrfHeaders(token) {
    return { 'X-CSRF-Token': token };
}

async function postWithCsrf(agent, path, body = {}, tokenPath = path) {
    const token = await fetchCsrfToken(agent, tokenPath);
    return agent.post(path).type('form').send({ ...body, _csrf: token });
}

async function deleteWithCsrf(agent, path, tokenPath = '/campgrounds/new') {
    const token = await fetchCsrfToken(agent, tokenPath);
    return agent.delete(path).set(csrfHeaders(token));
}

module.exports = {
    extractCsrfToken,
    fetchCsrfToken,
    csrfHeaders,
    postWithCsrf,
    deleteWithCsrf,
};
