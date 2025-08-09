/**
 * Network pathfinding utilities for calculating connection paths between contacts
 */

interface NetworkNode {
  id: string;
  name: string;
  relationshipStrength: 'weak' | 'medium' | 'strong';
  connectionType: 'introduced_by_me' | 'known_connection' | 'target_connection';
}

interface NetworkConnection {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  relationship_type: 'introduced_by_me' | 'known_connection' | 'target_connection';
  strength: 'weak' | 'medium' | 'strong';
  introduction_successful?: boolean;
  context?: string;
}

interface PathStep {
  contactId: string;
  contactName: string;
  title?: string;
  company?: string;
  profilePicture?: string;
  relationshipStrength: 'weak' | 'medium' | 'strong';
  connectionType: 'introduced_by_me' | 'known_connection' | 'target_connection';
  introductionStatus?: 'not_made' | 'pending' | 'successful' | 'declined';
  lastInteraction?: Date;
  notes?: string;
}

interface ConnectionPath {
  targetContactId: string;
  targetContactName: string;
  pathSteps: PathStep[];
  pathLength: number;
  confidence: number; // 0-100% confidence this path will work
  totalStrengthScore: number;
  hasIntroductionHistory: boolean;
}

/**
 * Calculates confidence score for a connection path based on relationship strengths
 * and introduction history
 */
function calculatePathConfidence(
  pathSteps: PathStep[],
  connections: NetworkConnection[]
): number {
  if (pathSteps.length === 0) return 0;
  if (pathSteps.length === 1) return 95; // Direct connection

  let strengthScore = 0;
  let introductionBonus = 0;
  const pathPenalty = Math.max(0, (pathSteps.length - 2) * 15); // Penalty for longer paths

  // Calculate strength score (0-70 points)
  for (let i = 0; i < pathSteps.length - 1; i++) {
    const currentStep = pathSteps[i];
    const nextStep = pathSteps[i + 1];
    
    // Find the connection between these two contacts
    const connection = connections.find(
      (conn) =>
        (conn.contact_a_id === currentStep.contactId && conn.contact_b_id === nextStep.contactId) ||
        (conn.contact_a_id === nextStep.contactId && conn.contact_b_id === currentStep.contactId)
    );

    if (connection) {
      const strengthPoints = 
        connection.strength === 'strong' ? 20 :
        connection.strength === 'medium' ? 12 :
        connection.strength === 'weak' ? 5 : 0;
      
      strengthScore += strengthPoints;

      // Bonus for successful introduction history
      if (connection.relationship_type === 'introduced_by_me' && connection.introduction_successful) {
        introductionBonus += 10;
      }
    }
  }

  // Normalize strength score to 0-70 range
  const maxPossibleStrength = (pathSteps.length - 1) * 20;
  const normalizedStrengthScore = (strengthScore / maxPossibleStrength) * 70;

  // Introduction history bonus (0-15 points)
  const normalizedIntroductionBonus = Math.min(introductionBonus, 15);

  // Base score (15 points for having any path)
  const baseScore = 15;

  // Calculate final confidence
  const confidence = Math.max(
    0,
    Math.min(
      100,
      baseScore + normalizedStrengthScore + normalizedIntroductionBonus - pathPenalty
    )
  );

  return Math.round(confidence);
}

/**
 * Builds a graph from network connections for pathfinding
 */
function buildNetworkGraph(
  connections: NetworkConnection[],
  nodes: NetworkNode[]
): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();

  // Initialize graph with all nodes
  nodes.forEach(node => {
    graph.set(node.id, new Set());
  });

  // Add connections (bidirectional)
  connections.forEach(connection => {
    const { contact_a_id, contact_b_id } = connection;
    
    if (!graph.has(contact_a_id)) graph.set(contact_a_id, new Set());
    if (!graph.has(contact_b_id)) graph.set(contact_b_id, new Set());
    
    graph.get(contact_a_id)!.add(contact_b_id);
    graph.get(contact_b_id)!.add(contact_a_id);
  });

  return graph;
}

/**
 * Uses BFS to find the shortest path between two contacts
 */
function findShortestPath(
  graph: Map<string, Set<string>>,
  startContactId: string,
  targetContactId: string,
  maxDepth: number = 4
): string[] {
  if (startContactId === targetContactId) return [startContactId];

  const queue: { contactId: string; path: string[] }[] = [
    { contactId: startContactId, path: [startContactId] }
  ];
  const visited = new Set<string>([startContactId]);

  while (queue.length > 0) {
    const { contactId, path } = queue.shift()!;

    // Don't search beyond max depth
    if (path.length > maxDepth) continue;

    const neighbors = graph.get(contactId) || new Set();

    for (const neighborId of neighbors) {
      if (neighborId === targetContactId) {
        return [...path, neighborId];
      }

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({
          contactId: neighborId,
          path: [...path, neighborId]
        });
      }
    }
  }

  return []; // No path found
}

/**
 * Converts a path of contact IDs into PathStep objects
 */
function buildPathSteps(
  contactIds: string[],
  nodes: NetworkNode[],
  connections: NetworkConnection[],
  contactDetails: Map<string, { title?: string; company?: string; profilePicture?: string }>
): PathStep[] {
  return contactIds.map((contactId, index) => {
    const node = nodes.find(n => n.id === contactId);
    const details = contactDetails.get(contactId) || {};
    
    // For the relationship strength, look at the connection to the next contact
    let relationshipStrength: 'weak' | 'medium' | 'strong' = 'medium';
    let connectionType: 'introduced_by_me' | 'known_connection' | 'target_connection' = 'known_connection';
    
    if (index < contactIds.length - 1) {
      const nextContactId = contactIds[index + 1];
      const connection = connections.find(
        (conn) =>
          (conn.contact_a_id === contactId && conn.contact_b_id === nextContactId) ||
          (conn.contact_a_id === nextContactId && conn.contact_b_id === contactId)
      );
      
      if (connection) {
        relationshipStrength = connection.strength;
        connectionType = connection.relationship_type;
      }
    }

    return {
      contactId,
      contactName: node?.name || 'Unknown Contact',
      title: details.title,
      company: details.company,
      profilePicture: details.profilePicture,
      relationshipStrength,
      connectionType,
      introductionStatus: 'not_made' as const,
    };
  });
}

/**
 * Main function to calculate connection paths to target contacts
 */
export function calculateConnectionPaths(
  currentContactId: string,
  targetContactIds: string[],
  networkNodes: NetworkNode[],
  connections: NetworkConnection[],
  contactDetails: Map<string, { title?: string; company?: string; profilePicture?: string }> = new Map(),
  maxPathLength: number = 4
): ConnectionPath[] {
  const graph = buildNetworkGraph(connections, networkNodes);
  const paths: ConnectionPath[] = [];

  for (const targetContactId of targetContactIds) {
    const targetNode = networkNodes.find(n => n.id === targetContactId);
    if (!targetNode) continue;

    // Find shortest path
    const contactIdPath = findShortestPath(
      graph,
      currentContactId,
      targetContactId,
      maxPathLength
    );

    if (contactIdPath.length === 0) {
      // No path found
      paths.push({
        targetContactId,
        targetContactName: targetNode.name,
        pathSteps: [],
        pathLength: 0,
        confidence: 0,
        totalStrengthScore: 0,
        hasIntroductionHistory: false,
      });
      continue;
    }

    // Build path steps
    const pathSteps = buildPathSteps(
      contactIdPath,
      networkNodes,
      connections,
      contactDetails
    );

    // Calculate metrics
    const confidence = calculatePathConfidence(pathSteps, connections);
    
    const totalStrengthScore = pathSteps.reduce((sum, step) => {
      const points = 
        step.relationshipStrength === 'strong' ? 3 :
        step.relationshipStrength === 'medium' ? 2 :
        step.relationshipStrength === 'weak' ? 1 : 0;
      return sum + points;
    }, 0);

    const hasIntroductionHistory = connections.some(
      conn => conn.relationship_type === 'introduced_by_me' && 
               contactIdPath.includes(conn.contact_a_id) && 
               contactIdPath.includes(conn.contact_b_id)
    );

    paths.push({
      targetContactId,
      targetContactName: targetNode.name,
      pathSteps,
      pathLength: pathSteps.length,
      confidence,
      totalStrengthScore,
      hasIntroductionHistory,
    });
  }

  // Sort by confidence (highest first), then by path length (shortest first)
  return paths.sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    return a.pathLength - b.pathLength;
  });
}

/**
 * Finds alternative paths to a target contact
 */
export function findAlternativePaths(
  currentContactId: string,
  targetContactId: string,
  networkNodes: NetworkNode[],
  connections: NetworkConnection[],
  contactDetails: Map<string, { title?: string; company?: string; profilePicture?: string }> = new Map(),
  maxPaths: number = 3,
  maxPathLength: number = 4
): ConnectionPath[] {
  const graph = buildNetworkGraph(connections, networkNodes);
  const targetNode = networkNodes.find(n => n.id === targetContactId);
  
  if (!targetNode) return [];

  const allPaths: string[][] = [];
  const visited = new Set<string>();

  // Modified BFS to find multiple paths
  function findMultiplePaths(
    startId: string,
    endId: string,
    currentPath: string[],
    depth: number
  ) {
    if (depth > maxPathLength || allPaths.length >= maxPaths) return;
    if (startId === endId) {
      allPaths.push([...currentPath, endId]);
      return;
    }

    const neighbors = graph.get(startId) || new Set();
    
    for (const neighborId of neighbors) {
      if (!currentPath.includes(neighborId)) {
        findMultiplePaths(neighborId, endId, [...currentPath, startId], depth + 1);
      }
    }
  }

  findMultiplePaths(currentContactId, targetContactId, [], 0);

  // Convert paths to ConnectionPath objects
  return allPaths.map(contactIdPath => {
    const pathSteps = buildPathSteps(
      contactIdPath,
      networkNodes,
      connections,
      contactDetails
    );

    const confidence = calculatePathConfidence(pathSteps, connections);
    
    const totalStrengthScore = pathSteps.reduce((sum, step) => {
      const points = 
        step.relationshipStrength === 'strong' ? 3 :
        step.relationshipStrength === 'medium' ? 2 :
        step.relationshipStrength === 'weak' ? 1 : 0;
      return sum + points;
    }, 0);

    const hasIntroductionHistory = connections.some(
      conn => conn.relationship_type === 'introduced_by_me' && 
               contactIdPath.includes(conn.contact_a_id) && 
               contactIdPath.includes(conn.contact_b_id)
    );

    return {
      targetContactId,
      targetContactName: targetNode.name,
      pathSteps,
      pathLength: pathSteps.length,
      confidence,
      totalStrengthScore,
      hasIntroductionHistory,
    };
  }).sort((a, b) => {
    // Sort by confidence first, then by path length
    if (a.confidence !== b.confidence) {
      return b.confidence - a.confidence;
    }
    return a.pathLength - b.pathLength;
  });
}